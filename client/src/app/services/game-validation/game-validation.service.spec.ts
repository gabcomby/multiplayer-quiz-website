/* eslint-disable no-restricted-imports */
import { TestBed } from '@angular/core/testing';

import { FormGroup } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { API_BASE_URL } from '@app/app.module';
import { Game, QuestionType } from '@app/interfaces/game';
import { ApiService } from '../api/api.service';
import { QuestionValidationService } from '../question-validation/question-validation.service';
import { QuestionService } from '../question/question.service';
import { SnackbarService } from '../snackbar/snackbar.service';
import { GameValidationService } from './game-validation.service';

describe('GameValidationService', () => {
    let service: GameValidationService;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let questionServiceValidationSpy: jasmine.SpyObj<QuestionValidationService>;
    let apiServiceSpy: jasmine.SpyObj<ApiService>;
    const defaultDate = new Date();
    const defaultGame: Game[] = [
        {
            id: '123',
            title: 'allo',
            description: 'test',
            isVisible: false,
            duration: 10,
            lastModification: defaultDate,
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: defaultDate,
                },
            ],
        },
        {
            id: '125',
            title: 'bonjour',
            description: 'test2',
            isVisible: false,
            duration: 20,
            lastModification: defaultDate,
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: defaultDate,
                },
            ],
        },
    ];

    beforeEach(() => {
        snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['getQuestion']);
        questionServiceValidationSpy = jasmine.createSpyObj('QuestionValidationService', [
            'validateQuestion',
            'verifyOneGoodAndBadAnswer',
            'answerValid',
        ]);
        apiServiceSpy = jasmine.createSpyObj('ApiService', ['getGames', 'createGame', 'patchGame']);

        TestBed.configureTestingModule({
            imports: [MatToolbarModule],
            providers: [
                GameValidationService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: SnackbarService, useValue: snackbarServiceSpy },
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: QuestionValidationService, useValue: questionServiceValidationSpy },
                { provide: ApiService, useValue: apiServiceSpy },
            ],
        });
        service = TestBed.inject(GameValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add error to array error if game has the same name of another one with validateDuplicateGame', async () => {
        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));
        const errors: string[] = [];
        const game = { ...defaultGame[0], id: 'different', description: 'good test' };
        await service.validateDuplicationGame(game, errors);
        expect(errors.length).toBe(1);
    });

    it('should add no error to array error if game doesn t have the same name or description of another one with validateDuplicateGame', async () => {
        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));
        const errors: string[] = [];
        const game = { ...defaultGame[0], id: 'different', description: 'good test', title: 'good' };
        await service.validateDuplicationGame(game, errors);
        expect(errors.length).toBe(0);
    });
    it('should return true if the game already exist', async () => {
        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));
        const result = await service.validateDeletedGame(defaultGame[0]);
        expect(result).toBeTrue();
    });
    it('should return false if the game has been deleted', async () => {
        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));
        const game = { ...defaultGame[0], id: 'different' };
        const result = await service.validateDeletedGame(game);
        expect(result).toBeFalse();
    });
    it('should return true if the game is valid and call createGame if deleted', async () => {
        const formGroupMock = new FormGroup({});
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };
        spyOn(service, 'createNewGame').and.returnValue(game);
        spyOn(service, 'isValidGame').and.returnValue(Promise.resolve(true));
        spyOn(service, 'validateDeletedGame').and.returnValue(Promise.resolve(true));
        const result = await service.gameValidationWhenModified(formGroupMock, game);

        expect(result).toBeTrue();
        expect(apiServiceSpy.patchGame).toHaveBeenCalled();
    });
    it('should return true if the game is valid and call patchGame if not deleted', async () => {
        const formGroupMock = new FormGroup({});
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };

        spyOn(service, 'isValidGame').and.returnValue(Promise.resolve(true));
        spyOn(service, 'createNewGame').and.returnValue(game);
        spyOn(service, 'validateDeletedGame').and.returnValue(Promise.resolve(false));
        const result = await service.gameValidationWhenModified(formGroupMock, game);

        expect(result).toBeTrue();
        expect(apiServiceSpy.createGame).toHaveBeenCalled();
    });
    it('should return false if the game is not valid', async () => {
        const formGroupMock = new FormGroup({});
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };

        spyOn(service, 'isValidGame').and.returnValue(Promise.resolve(false));
        spyOn(service, 'createNewGame').and.returnValue(game);
        spyOn(service, 'validateDeletedGame').and.returnValue(Promise.resolve(true));

        const result = await service.gameValidationWhenModified(formGroupMock, game);
        expect(result).toBeFalse();
    });

    it('should create new Game', async () => {
        const formGroupMock = new FormGroup({});
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };
        const isNewGame = false;
        const result = service.createNewGame(isNewGame, formGroupMock, game);
        expect(result.id).toBe(game.id);
        expect(result.isVisible).toBe(game.isVisible);
        expect(result.questions).toBe(game.questions);
        expect(result.duration).toBe(formGroupMock.get('time')?.value);
        expect(result.description).toBe(formGroupMock.get('description')?.value);
        expect(result.title).toBe(formGroupMock.get('name')?.value);
    });
    it('should create new Game', async () => {
        const formGroupMock = new FormGroup({});
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };
        const isNewGame = true;
        const result = service.createNewGame(isNewGame, formGroupMock, game);
        expect(result.isVisible).toBeFalse();
        expect(result.duration).toBe(formGroupMock.get('time')?.value);
        expect(result.description).toBe(formGroupMock.get('description')?.value);
        expect(result.title).toBe(formGroupMock.get('name')?.value);
        expect(questionServiceSpy.getQuestion).toHaveBeenCalled();
    });
    it('should return true is game is valid', async () => {
        spyOn(service, 'validateDuplicationGame');
        spyOn(service, 'validateBasicGameProperties');

        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));

        const errors: string[] = [];
        questionServiceValidationSpy.validateQuestion.and.returnValue(true);
        questionServiceValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);
        questionServiceValidationSpy.answerValid.and.returnValue(true);

        const result = await service.isValidGame(defaultGame[0]);

        expect(result).toBeTrue();
        expect(service.validateDuplicationGame).toHaveBeenCalledWith(defaultGame[0], errors);
        expect(service.validateBasicGameProperties).toHaveBeenCalledWith(defaultGame[0], errors);
        expect(snackbarServiceSpy.openSnackBar).not.toHaveBeenCalled();
    });
    it('should return false if question not valid', async () => {
        spyOn(service, 'validateDuplicationGame');
        spyOn(service, 'validateBasicGameProperties');

        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));

        const errors: string[] = [];
        questionServiceValidationSpy.validateQuestion.and.returnValue(false);

        const result = await service.isValidGame(defaultGame[0]);

        expect(result).toBeFalse();
        expect(service.validateBasicGameProperties).toHaveBeenCalledWith(defaultGame[0], errors);
    });
    it('should return false if choices not valid', async () => {
        spyOn(service, 'validateDuplicationGame');
        spyOn(service, 'validateBasicGameProperties');

        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));

        const errors: string[] = [];
        questionServiceValidationSpy.validateQuestion.and.returnValue(true);
        questionServiceValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(false);

        const result = await service.isValidGame(defaultGame[0]);

        expect(result).toBeFalse();
        expect(service.validateBasicGameProperties).toHaveBeenCalledWith(defaultGame[0], errors);
    });
    it('should return false if asnwers not valid', async () => {
        spyOn(service, 'validateDuplicationGame');
        spyOn(service, 'validateBasicGameProperties');

        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));

        const errors: string[] = [];
        questionServiceValidationSpy.validateQuestion.and.returnValue(true);
        questionServiceValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);
        questionServiceValidationSpy.answerValid.and.returnValue(false);

        const result = await service.isValidGame(defaultGame[0]);

        expect(result).toBeFalse();
        expect(service.validateBasicGameProperties).toHaveBeenCalledWith(defaultGame[0], errors);
    });
    it('should return false if errors lenght not 0', async () => {
        spyOn(service, 'validateBasicGameProperties').and.callFake(async (g: Game, err: string[]) => {
            err.push('erros');
        });
        spyOn(service, 'validateDuplicationGame');
        questionServiceValidationSpy.validateQuestion.and.returnValue(true);
        questionServiceValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);
        questionServiceValidationSpy.answerValid.and.returnValue(true);

        apiServiceSpy.getGames.and.returnValue(Promise.resolve(defaultGame));

        const result = await service.isValidGame(defaultGame[0]);

        expect(result).toBeFalse();
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalled();
    });
    it('should return add error to error array if game doesn t have valid data', async () => {
        const game = { ...defaultGame[0], title: '', description: ' ', duration: 5, questions: [] };
        const errors: string[] = [];
        service.validateBasicGameProperties(game, errors);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(errors.length).toBe(5);
    });
    it('should return add error to error array if game doesn t have valid data', async () => {
        const game = {
            ...defaultGame[0],
            title: '',
            description: '',
            duration: 0,
            lastModification: null as unknown as Date,
            questions: [],
        };
        const errors: string[] = [];
        service.validateBasicGameProperties(game, errors);

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(errors.length).toBe(8);
    });
    it('should return add error to error array if game doesn t have valid data', async () => {
        const game = { ...defaultGame[0] };
        const errors: string[] = [];
        service.validateBasicGameProperties(game, errors);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(errors.length).toBe(0);
    });
    it('should throw Error if error thrown', async () => {
        const formGroupMock = new FormGroup({});
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };

        spyOn(service, 'isValidGame').and.throwError('error');

        await expectAsync(service.gameValidationWhenModified(formGroupMock, game)).toBeRejected();
    });
    it('should throw Error if error thrown', async () => {
        const game = { ...defaultGame[0], description: 'good test', title: 'good' };

        spyOn(service, 'validateBasicGameProperties').and.throwError('error');

        await expectAsync(service.isValidGame(game)).toBeRejected();
    });
});
