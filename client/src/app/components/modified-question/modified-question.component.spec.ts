import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionService } from '@app/services/question.service';
import { ModifiedQuestionComponent } from './modified-question.component';
import SpyObj = jasmine.SpyObj;

describe('ModifiedQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let component: ModifiedQuestionComponent;
    let fixture: ComponentFixture<ModifiedQuestionComponent>;
    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['addQuestion', 'updateQuestion', 'getQuestion']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ModifiedQuestionComponent],
            providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
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

    // it('should initialize questionList with data from QuestionService', () => {
    //     const mockQuestionList: Question[] = [
    //         { id: 1, text: 'Question 1', type: '', points: 10 },
    //         { id: 2, text: 'Question 2', type: 'QCM', points: 10 },
    //     ];

    //     questionServiceSpy.getQuestion.and.returnValue(mockQuestionList);
    //     fixture.detectChanges();

    //     expect(component.questionList).toEqual(mockQuestionList);
    // });
    // it('should enable modification', () => {
    //     expect(component.modifiedDisable).toBeTrue();
    //     component.modifier();
    //     expect(component.modifiedDisable).toBeFalse();
    // });

    // it('should update questionList and disable modification on modifiedQuestion', () => {
    //     const mockQuestionList: Question[] = [
    //         { id: 1, text: 'Question 1', type: '', points: 10 },
    //         { id: 2, text: 'Question 2', type: '', points: 10 },
    //     ];

    //     component.questionList = mockQuestionList;
    //     component.modifiedDisable = false;

    //     component.modifiedQuestion();

    //     expect(questionServiceSpy.updateList).toHaveBeenCalledWith(mockQuestionList);
    //     expect(component.modifiedDisable).toBeTrue();
    // });

    // it('should remove a question from questionList', () => {
    //     const mockQuestionList: Question[] = [
    //         { id: 1, text: 'Question 1', type: '', points: 10 },
    //         { id: 2, text: 'Question 2', type: '', points: 10 },
    //     ];

    //     const questionToRemove: Question = { id: 1, text: 'Question 1', type: '', points: 10 };

    //     component.questionList = mockQuestionList;
    //     component.removeQuestion(questionToRemove);

    //     expect(component.questionList).not.toContain(questionToRemove);
    //     expect(questionServiceSpy.updateList).toHaveBeenCalledWith(component.questionList);
    // });
});
