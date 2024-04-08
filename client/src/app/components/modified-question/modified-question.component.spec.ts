import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
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
    let component: ModifiedQuestionComponent;
    let fixture: ComponentFixture<ModifiedQuestionComponent>;
    let questionValidationSpy: SpyObj<QuestionValidationService>;
    const defaultDate = new Date();

    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationSpy = jasmine.createSpyObj('SnackbarService', ['validateQuestion', 'verifyOneGoodAndBadAnswer']);
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

    // it('should initiliaze questionList with getQuestion from service and disabled modification', async () => {
    //     await component.loadQuestionsFromBank();
    //     expect(component.questionList).toEqual(await questionServiceSpy.getQuestions());
    //     expect(component.disabled).toEqual([true, true]);
    // });
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
});
