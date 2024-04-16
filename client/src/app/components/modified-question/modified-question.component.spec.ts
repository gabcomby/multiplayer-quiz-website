import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MAX_LENGTH } from '@app/config/client-config';
import { Question, QuestionType } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { ModifiedQuestionComponent } from './modified-question.component';
import SpyObj = jasmine.SpyObj;

@Component({
    selector: 'app-choice',
    template: '',
})
class AppChoiceStubComponent {
    @Input() question: unknown;
}

describe('ModifiedQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let snackbarServiceMock: SpyObj<SnackbarService>;
    let routerSpy: SpyObj<Router>;
    // const router = Router;
    let component: ModifiedQuestionComponent;
    let fixture: ComponentFixture<ModifiedQuestionComponent>;
    let questionValidationSpy: SpyObj<QuestionValidationService>;
    const defaultDate = new Date();

    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationSpy = jasmine.createSpyObj('SnackbarService', ['validateQuestion', 'verifyOneGoodAndBadAnswer']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            saveQuestion: {},
            addQuestion: {},
            updateList: {},
            updateQuestion: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: defaultDate,
                    choices: [],
                },
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test 2',
                    points: 20,
                    id: '45',
                    lastModification: defaultDate,
                    choices: [],
                } as Question,
            ],
            getQuestions: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: defaultDate,
                    choices: [],
                },
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test 2',
                    points: 20,
                    id: '45',
                    lastModification: defaultDate,
                    choices: [],
                } as Question,
            ],
            onQuestionAdded: {},
        });
        questionServiceSpy.onQuestionAdded = new EventEmitter<Question>();
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ModifiedQuestionComponent, AppChoiceStubComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: QuestionValidationService, useValue: questionValidationSpy },
                { provide: Router, useValue: routerSpy },
            ],
            imports: [DragDropModule, FormsModule, MatIconModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ModifiedQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call loadQuestionsFromBank when listQuestionBank is not null', () => {
        component.listQuestionBank = true;
        spyOn(component, 'loadQuestionsFromBank');
        component.ngOnInit();

        expect(component.loadQuestionsFromBank).toHaveBeenCalled();
    });
    it('should call setQuestionList when listQuestionBank is null', () => {
        component.listQuestionBank = false;
        spyOn(component, 'setQuestionList');
        component.ngOnInit();
        expect(component.setQuestionList).toHaveBeenCalled();
    });

    it('should add question to list and add true to disabled when eventEmitter from service', async () => {
        spyOn(questionServiceSpy.onQuestionAdded, 'emit');
        const mockQuestion = {
            type: QuestionType.QCM,
            text: 'Ceci est une question de test',
            points: 10,
            id: 'dsdsd',
            lastModification: defaultDate,
            choices: [],
        };
        component.disabled = [];
        component.ngOnInit();

        questionServiceSpy.onQuestionAdded.next(mockQuestion);
        expect(component.questionList).toContain(mockQuestion);
        fixture.detectChanges();
        expect(component.disabled[0]).toBeTrue();
    });

    it('should initialize questionList with data from QuestionService if the is no gameQuestion', () => {
        component.setQuestionList();
        component.gameQuestions = [];
        expect(component.questionList).toEqual(questionServiceSpy.getQuestion());
    });
    it('should initialize questionList with data from gameQuestion if gameQuestion is not null', () => {
        component.gameQuestions = [
            {
                type: QuestionType.QCM,
                text: 'Ceci est une question de test',
                points: 10,
                id: 'dsdsd',
                lastModification: defaultDate,
                choices: [],
            },
        ];
        component.setQuestionList();

        expect(component.questionList).toEqual(component.gameQuestions);
    });

    it('should enable modification', () => {
        const index = 0;
        component.disabled = [true];
        expect(component.disabled[index]).toBeTrue();
        component.toggleModify(index);
        expect(component.disabled[index]).toBeFalse();
    });
    it('toggle menu selection should toggle menuSelected', () => {
        component.menuSelected = true;
        component.toggleMenuSelection();
        expect(component.menuSelected).toBeFalse();
        component.toggleMenuSelection();
        expect(component.menuSelected).toBeTrue();
    });

    it('should call saveQuestion from service when saveQuestion is called', () => {
        const index = 1;
        component.saveQuestion(index);
        expect(questionServiceSpy.saveQuestion).toHaveBeenCalled();
    });
    it('should call saveQuestion from service when saveQuestion is called', () => {
        questionServiceSpy.saveQuestion.and.returnValue(true);
        component.fromBank = true;
        const index = 1;
        component.saveQuestion(index);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/question-bank']);
    });
    it('should call saveQuestion from service when saveQuestion is called', () => {
        component.disabled = [false, false];
        questionServiceSpy.saveQuestion.and.returnValue(true);

        const index = 1;
        component.saveQuestion(index);
        expect(component.disabled[index]).toBeTrue();
    });

    it('should remove a question from questionList and disable input modification', () => {
        const index = 0;
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: QuestionType.QCM, points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: QuestionType.QCM, points: 10, lastModification: defaultDate, choices: [] },
        ];

        const questionToRemove: Question = {
            id: '1',
            text: 'Question 1',
            type: QuestionType.QCM,
            points: 10,
            lastModification: defaultDate,
            choices: [],
        };

        component.questionList = mockQuestionList;
        component.removeQuestion(questionToRemove, index);

        expect(component.questionList).not.toContain(questionToRemove);
        expect(questionServiceSpy.updateList).toHaveBeenCalledWith(component.questionList);
        expect(component.disabled[index]).toBeTrue();
    });
    it('should load questions from bank', () => {
        component.loadQuestionsFromBank();
        expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });
    it('should truncate text if it exceeds MAX_LENGTH', () => {
        spyOn(component, 'cutText').and.callThrough();
        const questionMock = {
            type: QuestionType.QCM,
            // eslint-disable-next-line max-len -- it needs to be disable to test the function
            text: 'Ceci est une question de test qui est très longue et qui dépasse la limite de caractères autorisée. Nous sommes léquipe 102. Voici des caracteres pour augmenter la taille du texte pour quil soit a 200. A',
            points: 10,
            id: 'dsdsd',
            lastModification: defaultDate,
            choices: [],
        };
        component.cutText(questionMock);
        expect(questionMock.text.length).toBe(MAX_LENGTH + 3);
        expect(questionMock.text.endsWith('...')).toBe(true);
    });
});
