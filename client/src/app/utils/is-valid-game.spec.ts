import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { isValidGame } from '@app/utils/is-valid-game';

describe('is-valid-game', () => {
    let gameServiceMock: jasmine.SpyObj<GameService>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;
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
        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(true);

        expect(snackbarServiceMock.openSnackBar).not.toHaveBeenCalled();
    });

    it('should return false if the game title is missing', async () => {
        const game: Game = {
            id: '123456',
            title: '',
            description: 'Game without title',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [],
        };
        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if the game has no questions', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question is missing a type', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: '123',
                    lastModification: new Date(),
                    type: '',
                    text: 'Sample Question',
                    points: 10,
                    choices: [],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question is missing text', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: '12378',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: '',
                    points: 10,
                    choices: [],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question is missing points', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: '12309',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: 'Sample Question',
                    choices: [],
                    points: null as unknown as number,
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question has no choices', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game with no questions',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: '12',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a question has no correct choice', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game',
            isVisible: true,
            duration: 60,
            lastModification: new Date(),
            questions: [
                {
                    id: '123765',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [
                        { text: 'Choice 1', isCorrect: false },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if the duration is not between 10 and 60 seconds', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game',
            isVisible: true,
            duration: 0,
            lastModification: new Date(),
            questions: [
                {
                    id: '123765',
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

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if a choice has no text', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game',
            isVisible: true,
            duration: 0,
            lastModification: new Date(),
            questions: [
                {
                    id: '123765',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [
                        { text: '', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if the duration if points not a multiple of 10', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game',
            isVisible: true,
            duration: 0,
            lastModification: new Date(),
            questions: [
                {
                    id: '123765',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 14,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return false if the isCorrect attribute of a choice is undefined', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: 'A game',
            isVisible: true,
            duration: 0,
            lastModification: new Date(),
            questions: [
                {
                    id: '123765',
                    lastModification: new Date(),
                    type: 'QCM',
                    text: 'Sample Question',
                    points: 10,
                    choices: [
                        { text: 'Choice 1', isCorrect: undefined },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });

    it('should return if question type is QRL', async () => {
        const game: Game = {
            id: '123456',
            title: 'Game',
            description: '',
            isVisible: true,
            duration: 0,
            lastModification: new Date(),
            questions: [
                {
                    id: '123765',
                    lastModification: new Date(),
                    type: 'QCL',
                    text: 'Sample Question',
                    points: 10,
                },
            ],
        };

        const isValid = await isValidGame(game, snackbarServiceMock, gameServiceMock);
        expect(isValid).toBe(false);
    });
});
