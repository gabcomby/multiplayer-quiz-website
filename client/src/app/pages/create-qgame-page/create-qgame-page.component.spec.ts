/* eslint-disable-next-line max-classes-per-file -- Those are  mock class */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import { Game, Question, QuestionType } from '@app/interfaces/game';
import { ApiService } from '@app/services/api/api.service';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { of } from 'rxjs';
import { CreateQGamePageComponent } from './create-qgame-page.component';

import SpyObj = jasmine.SpyObj;

@Component({
    selector: 'app-modified-question',
    template: '',
})
class AppModifiedQuestionStubComponent {
    @Input() questions: unknown[];
}

@Component({
    selector: 'app-new-question',
    template: '',
})
class AppNewQuestionStubComponent {
    @Input() formBank: unknown[];
}

describe('CreateQGamePageComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let gameServiceSpy: SpyObj<GameValidationService>;
    let snackbarServiceMock: SpyObj<SnackbarService>;
    let apiServiceSpy: SpyObj<ApiService>;
    let routerSpy: SpyObj<Router>;
    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;
    const defaultDate = new Date();
    const defaultGame = [
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
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            updateList: {},
            getQuestion: [
                {
                    type: QuestionType.QCM,
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                },
                {
                    type: QuestionType.QCM,
                    text: 'Ceci est une question de test 2',
                    points: 20,
                    id: '45',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                } as Question,
            ],
            resetQuestions: {},
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', {
            getGames: [],
            createGame: {},
            patchGame: Promise.resolve({
                id: 'ddwd',
                title: 'string',
                description: 'string',
                isVisible: false,
                duration: 10,
                lastModification: defaultDate,
                questions: [
                    { type: QuestionType.QCM, text: 'Ceci est une question de test', points: 10, id: 'dsdsd', lastModification: defaultDate },
                ],
            } as Game),
            validateDeletedGame: Promise.resolve({}),
            validateDuplicationGame: {},
            gameValidationWhenModified: {},
            createNewGame: {},
            isValidGame: {},
        });
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        apiServiceSpy = jasmine.createSpyObj('ApiService', { getGames: of(defaultGame) });
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent, AppModifiedQuestionStubComponent, AppNewQuestionStubComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: GameValidationService, useValue: gameServiceSpy },
                { provide: ApiService, useValue: apiServiceSpy },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '123' })) } },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: Router, useValue: routerSpy },
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
                { provide: MatDialog, useValue: { open: (_comp: unknown, _obj: unknown) => {} } },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
            ],
            imports: [HttpClientTestingModule, MatToolbarModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.modifiedQuestion).toBeFalse();
        expect(component.games).toEqual([]);
        expect(component.dataReady).toBeFalse();
    });

    it('initialize forms controls', () => {
        expect(component.gameForm.get('name')).toBeTruthy();
        expect(component.gameForm.get('description')).toBeTruthy();
        expect(component.gameForm.get('time')).toBeTruthy();
    });
    it('ngOnInit should initiliase if theres is an id', async () => {
        spyOn(component, 'getGame');
        spyOn(component, 'insertIfExist');

        await component.ngOnInit();
        expect(component.getGame).toHaveBeenCalled();
        expect(component.insertIfExist).toHaveBeenCalled();
        expect(component.dataReady).toBeTrue();
    });
    it('ngOnInit should throw error if error thrown', async () => {
        apiServiceSpy.getGames.and.throwError('test error');
        spyOn(component, 'handleServerError');
        await component.ngOnInit();

        expect(component.handleServerError).toHaveBeenCalled();
    });
    it('get game should find game with id in list should return game if found', () => {
        component.games = defaultGame;
        component.getGame('123');
        expect(component.gameModified).toEqual({
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
        });
    });
    it('get game should return undefined game with id if not found', () => {
        component.gameModified = {
            id: '',
            title: '',
            description: '',
            isVisible: false,
            duration: 10,
            lastModification: defaultDate,
            questions: [],
        };
        component.games = defaultGame;
        try {
            component.getGame('124');
        } catch (error) {
            expect(error).toEqual(new Error('Game with id 124 not found'));
        }
        expect(component.gameModified).toEqual({
            id: '',
            title: '',
            description: '',
            isVisible: false,
            duration: 10,
            lastModification: defaultDate,
            questions: [],
        });
    });

    it('initialize forms controls with value when gameId is not null', () => {
        const TIMER_DURATION = 10;
        component.gameForm = new FormGroup({
            name: new FormControl(''),
            description: new FormControl(''),
            time: new FormControl(''),
        });
        component.gameModified = defaultGame[0];
        component.insertIfExist();
        expect(component.gameForm).toBeTruthy();
        expect(component.gameForm.get('name')?.value).toBe('allo');
        expect(component.gameForm.get('description')?.value).toBe('test');
        expect(component.gameForm.get('time')?.value).toBe(TIMER_DURATION);
    });

    it('should call createNewGame from service when onSubmit', async () => {
        gameServiceSpy.gameValidationWhenModified.and.returnValue(Promise.resolve(true));

        await component.onSubmit();

        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should throw error if submitting with the server down', async () => {
        gameServiceSpy.gameValidationWhenModified.and.throwError('test error');
        component.gameId = '123';
        spyOn(component, 'handleServerError');

        await component.onSubmit();

        expect(component.handleServerError).toHaveBeenCalled();
    });
    it('should toggle modifiedQuestion property', () => {
        expect(component.modifiedQuestion).toBeFalse();

        component.toggleModifiedQuestion();
        expect(component.modifiedQuestion).toBeTrue();

        component.toggleModifiedQuestion();
        expect(component.modifiedQuestion).toBeFalse();
    });
});
