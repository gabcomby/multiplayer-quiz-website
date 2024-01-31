import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePageQuestionsComponent } from './game-page-questions.component';

enum AnswerStatusEnum {
    Correct,
    Wrong,
    Unanswered,
    PartiallyCorrect,
}

describe('GamePageQuestionsComponent', () => {
    let component: GamePageQuestionsComponent;
    let fixture: ComponentFixture<GamePageQuestionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GamePageQuestionsComponent],
        });
        fixture = TestBed.createComponent(GamePageQuestionsComponent);
        component = fixture.componentInstance;
        component.question = 'Sample Question';
        // component.choices = ['Answer 1', 'Answer 2'];
        component.choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: true },
        ];
        component.mark = 10;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should calculate score correctly for single choice questions', () => {
        component.choices = [
            { text: 'Answer 1', isCorrect: true },
            { text: 'Answer 2', isCorrect: false },
        ];

        component.mark = 10;
        component.selectedChoices = [0]; // Selecting the correct answer
        component.calculateScoreForTheQuestion();
        expect(component.answerStatus).toEqual(AnswerStatusEnum.Correct);
        // Uncomment the next line once we emit the score
        // expect(component.scoreForTheQuestion.emit).toHaveBeenCalledWith(10);
    });

    it('should calculate score correctly for multiple choice questions', () => {
        component.choices = [
            { text: 'Answer 1', isCorrect: true },
            { text: 'Answer 2', isCorrect: true },
            { text: 'Answer 3', isCorrect: false },
        ];
        component.mark = 10;
        component.selectedChoices = [0, 1];
        component.calculateScoreForTheQuestion();
        expect(component.answerStatus).toEqual(AnswerStatusEnum.Correct);
        // Uncomment the next line once we emit the score
        // expect(component.scoreForTheQuestion.emit).toHaveBeenCalledWith(10);
    });

    it('should not toggle any answer if timer has expired', () => {
        component.timerExpired = true;
        component.toggleAnswer(1);
        expect(component.selectedChoices.length).toBe(0);
    });

    it('should toggle a single answer for single-choice questions', () => {
        component.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: false },
        ];
        component.toggleAnswer(0);
        expect(component.selectedChoices).toEqual([0]);
        component.toggleAnswer(1);
        expect(component.selectedChoices).toEqual([1]);
    });

    it('should allow multiple answers to be toggled for multiple-choice questions', () => {
        component.toggleAnswer(0);
        expect(component.selectedChoices).toContain(0);
        component.toggleAnswer(2);
        expect(component.selectedChoices).toContain(2);
        expect(component.selectedChoices.length).toBe(2);
    });

    it('should untoggle a selected answer', () => {
        component.toggleAnswer(0);
        expect(component.selectedChoices).toContain(0);
        component.toggleAnswer(0);
        expect(component.selectedChoices).not.toContain(0);
    });
});
