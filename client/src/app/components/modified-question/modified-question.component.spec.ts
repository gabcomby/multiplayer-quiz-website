import { DragDropModule } from '@angular/cdk/drag-drop';
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
                    lastModification: new Date(),
                } as Question,
            ],
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

    it('should initialize questionList with data from QuestionService', () => {
        // const mockQuestionList: Question[] = [
        //     { id: '1', text: 'Question 1', type: '', points: 10, lastModification: new Date() },
        //     { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: new Date() },
        // ];

        // questionServiceSpy.getQuestion.and.returnValue(mockQuestionList);
        fixture.detectChanges();

        expect(component.questionList).toEqual(questionServiceSpy.getQuestion());
    });
    it('should enable modification', () => {
        const index = 0;
        expect(component.disabled[index]).toBeTrue();
        component.toggleModify(index);
        expect(component.disabled[index]).toBeFalse();
    });

    it('should update questionList and disable modification on modifiedQuestion', () => {
        const index = 1;
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: new Date() },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: new Date() },
        ];

        component.questionList = mockQuestionList;
        component.saveQuestion(index);

        expect(questionServiceSpy.updateList).toHaveBeenCalledWith(mockQuestionList);
        expect(component.disabled[index]).toBeTrue();
    });

    it('should remove a question from questionList', () => {
        const mockQuestionList: Question[] = [
            { id: '1', text: 'Question 1', type: '', points: 10, lastModification: new Date() },
            { id: '4', text: 'Question 2', type: 'QCM', points: 10, lastModification: new Date() },
        ];

        const questionToRemove: Question = { id: '1', text: 'Question 1', type: '', points: 10, lastModification: new Date() };

        component.questionList = mockQuestionList;
        component.removeQuestion(questionToRemove);

        expect(component.questionList).not.toContain(questionToRemove);
        expect(questionServiceSpy.updateList).toHaveBeenCalledWith(component.questionList);
    });
});
