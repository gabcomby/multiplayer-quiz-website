import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Game, Question } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import * as gameUtilsModule from '@app/utils/is-valid-game';

import { of } from 'rxjs';
import { CreateQGamePageComponent } from './create-qgame-page.component';
import SpyObj = jasmine.SpyObj;

describe('CreateQGamePageComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let gameServiceSpy: SpyObj<GameService>;
    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;
    const defaultDate = new Date();

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            updateList: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: defaultDate,
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
                isVisible: true,
                duration: 10,
                lastModification: defaultDate,
                questions: [{ type: 'QCM', text: 'Ceci est une question de test', points: 10, id: 'dsdsd', lastModification: defaultDate }],
            } as Game),
        });
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '123' })) } },
            ],
            imports: [HttpClientTestingModule],
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
        expect(component.addQuestionShown).toBeTrue();
        expect(component.gamesFromDB).toEqual([]);
        expect(component.dataReady).toBeFalse();
    });

    it('initialize forms controls', () => {
        expect(component.gameForm.get('name')).toBeTruthy();
        expect(component.gameForm.get('description')).toBeTruthy();
        expect(component.gameForm.get('time')).toBeTruthy();
        expect(component.gameForm.get('visibility')).toBeTruthy();
    });

    it('should call patchGame from GameService when onSubmit is called with an existing game', async () => {
        const TIME = 10;
        const mockGameForm = new FormGroup({
            name: new FormControl('Test Game'),
            description: new FormControl('Description'),
            time: new FormControl(TIME),
        });
        spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
        spyOn(gameUtilsModule, 'validateDeletedGame').and.returnValue(Promise.resolve(true));

        await component.onSubmit(mockGameForm).then(() => {
            expect(component.gameId).toBe('123');
            fixture.detectChanges();
            expect(gameServiceSpy.patchGame).toHaveBeenCalled();
        });
    });
    it('should call create from GameService when onSubmit is called with an existing game but was deleted', async () => {
        const TIME = 10;
        const mockGameForm = new FormGroup({
            name: new FormControl('Test Game'),
            description: new FormControl('Description'),
            time: new FormControl(TIME),
        });

        spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
        spyOn(gameUtilsModule, 'validateDeletedGame').and.returnValue(Promise.resolve(false));
        await component.onSubmit(mockGameForm).then(() => {
            expect(component.gameId).toBe('123');
            fixture.detectChanges();
            expect(gameServiceSpy.createGame).toHaveBeenCalled();
        });
    });
});

// pour autre route
describe('CreateQGamePageComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let gameServiceSpy: SpyObj<GameService>;
    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;
    const defaultDate = new Date();

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            updateList: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: defaultDate,
                } as Question,
            ],
            resetQuestions: {},
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', {
            getGames: [],
            // eslint-disable-next-line no-unused-vars
            createGame: (game: Game) => {
                return;
            },
        });
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: null })) } },
            ],
            imports: [HttpClientTestingModule],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call createGame from GameService when onSubmit is called with validData', () => {
        const TIME = 10;
        const mockGameForm = new FormGroup({
            name: new FormControl('Test Game'),
            description: new FormControl('Description'),
            time: new FormControl(TIME),
        });
        spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
        component.onSubmit(mockGameForm).then(() => {
            expect(component.gameId).toBe(null);
            fixture.detectChanges();
            expect(gameServiceSpy.createGame).toHaveBeenCalled();
        });
    });
});
