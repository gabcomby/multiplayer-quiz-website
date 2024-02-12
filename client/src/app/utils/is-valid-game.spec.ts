import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import {
    isValidGame,
    validateBasicGameProperties,
    validateGameQuestions,
    validateQuestionChoicesImport,
    validateQuestionImport,
} from '@app/utils/is-valid-game';

describe('is-valid-game', () => {
    let gameServiceMock: jasmine.SpyObj<GameService>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;
    const game: Game = {
        id: '123456',
        title: 'Valid Game',
        description: 'A valid game description',
        isVisible: true,
        duration: 60,
        lastModification: new Date(),
        questions: [
            {
                id: '12345',
                lastModification: new Date(),
                type: 'QCM',
                text: 'Sample Question',
                points: 10,
                choices: [
                    { text: 'Choice 1', isCorrect: true },
                    { text: 'Choice 2', isCorrect: false },
                ],
            },
        ],
    };
    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        gameServiceMock = jasmine.createSpyObj('GameService', ['validateDuplicationGame']);

        TestBed.configureTestingModule({
            providers: [
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: GameService, useValue: gameServiceMock },
            ],
        });
    });

    it('should validate a valid game', async () => {
        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(true);

        expect(snackbarServiceMock.openSnackBar).not.toHaveBeenCalled();
    });

    it('should push errors for title missing and no whitespaces if no game title', async () => {
        const gameNoTitle = { ...game, title: '' };

        const errors: string[] = [];
        validateBasicGameProperties(gameNoTitle, errors);
        expect(errors.length).toBe(2);
        expect(errors[0]).toEqual('Le titre est requis');
    });

    it('should push error if the game description is missing', async () => {
        const gameNoDescription = { ...game, description: '' };

        const errors: string[] = [];
        validateBasicGameProperties(gameNoDescription, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('La description est requise');
    });

    it('should push error if no game duration', async () => {
        const gameNoDuration: Game = { ...game, duration: null as unknown as number };

        const errors: string[] = [];
        validateBasicGameProperties(gameNoDuration, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('La durée est requise');
    });

    it('should push error if the duration is not between 10 and 60 seconds', async () => {
        const gameDurationNotBetween10And60Seconds: Game = { ...game, duration: 5 };

        const errors: string[] = [];
        validateBasicGameProperties(gameDurationNotBetween10And60Seconds, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('La durée doit être entre 10 et 60 secondes');
    });

    it('should push error if lastModification is missing', async () => {
        const gameNoLastModif: Game = { ...game, lastModification: null as unknown as Date };

        const errors: string[] = [];
        validateBasicGameProperties(gameNoLastModif, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('La date de mise à jour est requise');
    });

    it('should push error if the game has no questions', async () => {
        const gameNoQuestions: Game = { ...game, questions: [] };
        const errors: string[] = [];
        validateGameQuestions(gameNoQuestions, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('Au moins une question est requise');
    });

    it('should push error if a question is missing a type', async () => {
        const gameNoType: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    type: '',
                },
                ...game.questions.slice(1),
            ],
        };

        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionImport(gameNoType.questions[0], questionIndex, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('Question 1: Type est requis');
    });

    it('should push errors for missing text and no whitespaces if a question is missing text', async () => {
        const gameMissingText: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    text: '',
                },
                ...game.questions.slice(1),
            ],
        };

        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionImport(gameMissingText.questions[0], questionIndex, errors);
        expect(errors.length).toBe(2);
        expect(errors[0]).toEqual('Question 1: Text est requis');
    });

    it('should push error if a question is missing points', async () => {
        const gameQuestionMissingPoints: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    points: null as unknown as number,
                },
                ...game.questions.slice(1),
            ],
        };
        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionImport(gameQuestionMissingPoints.questions[0], questionIndex, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('Question 1: Points sont requis');
    });

    it('should push error if a question has no choices', async () => {
        const gameHasNoChoice: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    choices: [],
                },
                ...game.questions.slice(1),
            ],
        };

        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionChoicesImport(gameHasNoChoice.questions[0], questionIndex, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('Question 1: Au moins un choix est requis');
    });

    it('should push error if a question has no correct choice', async () => {
        const gameHasNoCorrectChoice: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    choices: game.questions[0]?.choices?.map((choice) => ({ ...choice, isCorrect: false })) || [],
                },
                ...game.questions.slice(1),
            ],
        };

        const isValid = await isValidGame(gameHasNoCorrectChoice, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });
    it('should push errors for missing text and no whitespaces if a choice has no text', async () => {
        const gameHasChoiceNoText: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    choices: [
                        {
                            ...game.questions[0].choices[0],
                            text: '',
                        },
                    ],
                },
                ...game.questions.slice(1),
            ],
        };

        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionChoicesImport(gameHasChoiceNoText.questions[0], questionIndex, errors);
        expect(errors.length).toBe(2);
    });

    it('should push errors is choice.isCorrect is undefined', async () => {
        const gameHasChoiceIsCorrectUndefined: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    choices: [
                        {
                            ...game.questions[0].choices[0],
                            isCorrect: null as unknown as boolean,
                        },
                    ],
                },
                ...game.questions.slice(1),
            ],
        };

        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionChoicesImport(gameHasChoiceIsCorrectUndefined.questions[0], questionIndex, errors);
        expect(errors.length).toBe(1);
    });

    it('should push error if the duration if points not a multiple of 10', async () => {
        const gameNotMultipleOf10: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    points: 13,
                },
                ...game.questions.slice(1),
            ],
        };

        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionImport(gameNotMultipleOf10.questions[0], questionIndex, errors);
        expect(errors.length).toBe(1);
        expect(errors[0]).toEqual('Question 1: Les points doivent être des multiples de 10');
    });
    it('should return without errors if question type is QRL', async () => {
        const gameQRL: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    text: 'QRL',
                },
                ...game.questions.slice(1),
            ],
        };
        const questionIndex = 0;
        const errors: string[] = [];
        validateQuestionChoicesImport(gameQRL.questions[0], questionIndex, errors);
        expect(errors.length).toBe(0);
    });

    it('should return without errors if the question type is QRL', () => {
        const gameQRL: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    text: 'QRL',
                },
                ...game.questions.slice(1),
            ],
        };
        const questionIndex = 0;
        const errors: string[] = [];

        validateQuestionChoicesImport(gameQRL.questions[0], questionIndex, errors);

        expect(errors.length).toBe(0);
    });

    it('should not modify errors array if the question type is QRL', () => {
        const gameQRL: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    text: 'QRL',
                },
                ...game.questions.slice(1),
            ],
        };
        const questionIndex = 0;
        const errors: string[] = ['Existing error'];
        validateQuestionChoicesImport(gameQRL.questions[0], questionIndex, errors);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe('Existing error');
    });
});
