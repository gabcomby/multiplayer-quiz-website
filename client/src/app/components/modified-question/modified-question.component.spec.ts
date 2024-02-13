import { DragDropModule } from '@angular/cdk/drag-drop';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { ModifiedQuestionComponent } from './modified-question.component';
import SpyObj = jasmine.SpyObj;

describe('ModifiedQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let snackbarServiceMock: SpyObj<SnackbarService>;
    let component: ModifiedQuestionComponent;
    let fixture: ComponentFixture<ModifiedQuestionComponent>;
    let questionValidationSpy: SpyObj<QuestionValidationService>;
    const defaultDate = new Date();
    const questionList = [
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
        },
    ];
    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationSpy = jasmine.createSpyObj('SnackbarService', ['validateQuestion', 'verifyOneGoodAndBadAnswer']);
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
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
            declarations: [ModifiedQuestionComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: QuestionValidationService, useValue: questionValidationSpy },
            ],
            imports: [DragDropModule],
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

    it('should initiliaze questionList with getQuestion from service and disabled modification', async () => {
        await component.loadQuestionsFromBank();
        expect(component.questionList).toEqual(await questionServiceSpy.getQuestions());
        expect(component.disabled).toEqual([true, true]);
    });
    it('should add question to list and add true to disabled when eventEmitter from service', async () => {
        spyOn(questionServiceSpy.onQuestionAdded, 'emit');
        const mockQuestion = {
            type: 'QCM',
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
                type: 'QCM',
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
    it('when saveQuestion is called, initialize with new date', () => {
        const index = 1;
        component.saveQuestion(index);
        expect(component.questionList[index].lastModification).toEqual(new Date());
    });
    it('when saveQuestion is from questionBank, it should update list and disabled with valid data', () => {
        component.disabled = [false, false];
        component.listQuestionBank = true;

        component.questionList = questionList;
        questionValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);

        questionValidationSpy.validateQuestion.and.returnValue(true);
        const index = 1;
        component.saveQuestion(index);
        expect(questionServiceSpy.updateQuestion).toHaveBeenCalled();
        expect(component.disabled[index]).toBeTrue();
    });
    it('when saveQuestion is not from questionBank, it should update list and disabled with valid data', () => {
        component.disabled = [false, false];
        component.listQuestionBank = false;

        component.questionList = questionList;
        questionValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);

        questionValidationSpy.validateQuestion.and.returnValue(true);

        const index = 1;
        component.saveQuestion(index);
        expect(questionServiceSpy.updateList).toHaveBeenCalled();
        expect(component.disabled[index]).toBeTrue();
    });

    it('when saveQuestion with no valid data, it should not update list or update question', () => {
        component.disabled = [false, false];
        questionValidationSpy.validateQuestion.and.returnValue(false);
        questionValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);
        const index = 1;
        component.questionList = questionList;

        expect(questionServiceSpy.updateList).not.toHaveBeenCalled();
        expect(questionServiceSpy.updateQuestion).not.toHaveBeenCalled();
        expect(component.disabled[index]).toBeFalse();
    });

    it('should remove a question from questionList and disable input modification', () => {
        const index = 0;
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ];

        const questionToRemove: Question = { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate, choices: [] };

        component.questionList = mockQuestionList;
        component.removeQuestion(questionToRemove, index);

        expect(component.questionList).not.toContain(questionToRemove);
        expect(questionServiceSpy.updateList).toHaveBeenCalledWith(component.questionList);
        expect(component.disabled[index]).toBeTrue();
    });

    it('should switch the answer selected and the one on top', () => {
        component.questionList = [
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ];

        component.moveQuestionUp(1);
        expect(component.questionList).toEqual([
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ]);
    });

    it('should not switch the answers if its the first choice', () => {
        component.questionList = [
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ];

        component.moveQuestionUp(0);
        expect(component.questionList).toEqual([
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ]);
    });

    it('should switch the answer selected and the one underneath', () => {
        component.questionList = [
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '5', text: 'Question 3', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ];

        component.moveQuestionDown(1);
        expect(component.questionList).toEqual([
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '5', text: 'Question 3', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ]);
    });

    it('should not switch the answers if its the last choice', () => {
        component.questionList = [
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '5', text: 'Question 3', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ];

        component.moveQuestionDown(3);
        expect(component.questionList).toEqual([
            { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
            { id: '5', text: 'Question 3', type: 'QCM', points: 10, lastModification: defaultDate, choices: [] },
        ]);
    });
});
