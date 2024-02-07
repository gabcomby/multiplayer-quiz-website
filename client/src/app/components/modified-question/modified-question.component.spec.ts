import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { ModifiedQuestionComponent } from './modified-question.component';
import SpyObj = jasmine.SpyObj;

describe('ModifiedQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let component: ModifiedQuestionComponent;
    let fixture: ComponentFixture<ModifiedQuestionComponent>;
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
                },
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test 2',
                    points: 20,
                    id: '45',
                    lastModification: defaultDate,
                } as Question,
            ],
            getQuestions: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: defaultDate,
                },
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test 2',
                    points: 20,
                    id: '45',
                    lastModification: defaultDate,
                } as Question,
            ],
            onQuestionAdded: {},
        });
        questionServiceSpy.onQuestionAdded = new EventEmitter<Question>();
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ModifiedQuestionComponent],
            providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
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
    it('should add question to list and add true to disabled when eventEmitter from service', () => {
        spyOn(questionServiceSpy.onQuestionAdded, 'emit');
        const mockQuestion = {
            type: 'QCM',
            text: 'Ceci est une question de test',
            points: 10,
            id: 'dsdsd',
            lastModification: defaultDate,
        };
        component.disabled = [];
        component.ngOnInit();

        questionServiceSpy.onQuestionAdded.emit(mockQuestion);
        expect(component.questionList).toContain(mockQuestion);
        // expect(component.disabled).toContain(true);
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

    it('should update questionList and disable modification on modifiedQuestion', () => {
        const index = 1;
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate },
        ];

        component.questionList = mockQuestionList;
        component.saveQuestion(index);

        expect(questionServiceSpy.updateList).toHaveBeenCalledWith(mockQuestionList);
        expect(component.disabled[index]).toBeTrue();
    });

    it('should remove a question from questionList and disable input modification', () => {
        const index = 0;
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate },
        ];

        const questionToRemove: Question = { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate };

        component.questionList = mockQuestionList;
        component.removeQuestion(questionToRemove, index);

        expect(component.questionList).not.toContain(questionToRemove);
        expect(questionServiceSpy.updateList).toHaveBeenCalledWith(component.questionList);
        expect(component.disabled[index]).toBeTrue();
    });

    it('should move the answers in the array after the drop', () => {
        const event = {
            previousIndex: 0,
            currentIndex: 1,
        } as CdkDragDrop<Question[]>;
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate },
        ];

        component.questionList = mockQuestionList;

        component.drop(event);

        expect(component.questionList).toEqual([
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: defaultDate },
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: defaultDate },
        ]);
    });
});
