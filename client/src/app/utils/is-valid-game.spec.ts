import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { isValidGame, validateQuestionChoicesImport } from '@app/utils/is-valid-game';

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

    it('should return false if the game title is missing', async () => {
        const gameNoTitle = { ...game, title: '' };

        const isValid = await isValidGame(gameNoTitle, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if the game has no questions', async () => {
        const gameNoQuestions: Game = { ...game, questions: [] };
        const isValid = await isValidGame(gameNoQuestions, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question is missing a type', async () => {
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

        const isValid = await isValidGame(gameNoType, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question is missing text', async () => {
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

        const isValid = await isValidGame(gameMissingText, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question is missing points', async () => {
        const gameQuestionMissingPoints: Game = {
            ...game,
            questions: [
                {
                    ...game.questions[0],
                    text: '',
                },
                ...game.questions.slice(1),
            ],
        };
        const isValid = await isValidGame(gameQuestionMissingPoints, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question has no choices', async () => {
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
        expect(errors[0]).toEqual('Question 1: At least one choice is required');
    });

    it('should return false if a question has no correct choice', async () => {
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

    it('should return false if the duration is not between 10 and 60 seconds', async () => {
        const gameDurationNotBetween10And60Seconds: Game = { ...game, duration: 5 };

        const isValid = await isValidGame(gameDurationNotBetween10And60Seconds, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return errors for missing text and no whitespaces if a choice has no text', async () => {
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

    it('should return false if the duration if points not a multiple of 10', async () => {
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

        const isValid = await isValidGame(gameNotMultipleOf10, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
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
});
