import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

// import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { CreateQGamePageComponent } from './create-qgame-page.component';
import SpyObj = jasmine.SpyObj;

describe('CreateQGamePageComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;
    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['addQuestion', 'getQuestion']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent],
            providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
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

    it('initialize forms controls', () => {
        expect(component.gameForm.get('name')).toBeTruthy();
        expect(component.gameForm.get('description')).toBeTruthy();
        expect(component.gameForm.get('time')).toBeTruthy();
    });

    it('should toggle addQuestionShown property', () => {
        expect(component.addQuestionShown).toBeFalse();
        component.toggleAddQuestion();
        expect(component.addQuestionShown).toBeTrue();
    });
    it('should toggle modifiedQuestion property', () => {
        expect(component.modifiedQuestion).toBeFalse();
        component.toggleModifiedQuestion();
        expect(component.modifiedQuestion).toBeTrue();
    });
    // it('should call addQuestion du service', () => {
    //     const mockQuestion: Question = { id: 15, type: '', text: 'Quelle est la capitale du Canada', points: 10 };
    //     component.addQuestion(mockQuestion);
    //     expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
    // });

    // it('should reset the form after adding a question', () => {
    //     const mockQuestion: Question = { id: 15, type: '', text: 'Quelle est la capitale du Canada', points: 10 };
    //     component.addQuestion(mockQuestion);

    // });
});
