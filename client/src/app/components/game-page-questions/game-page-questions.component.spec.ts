import { CUSTOM_ELEMENTS_SCHEMA, Component, Input, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerStateService } from '@app/services/answer-state.service';
import { SocketService } from '@app/services/socket.service';
import { GamePageQuestionsComponent } from './game-page-questions.component';

@Component({
    selector: 'app-game-page-questions',
    template: '',
})
class AppGamePageQuestionsStubComponent {
    @Input() timerExpired: unknown;
}

describe('GamePageQuestionsComponent', () => {
    let component: GamePageQuestionsComponent;
    let fixture: ComponentFixture<GamePageQuestionsComponent>;
    let answerStateServiceSpy: jasmine.SpyObj<AnswerStateService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        answerStateServiceSpy = jasmine.createSpyObj('AnswerStateService', ['lockAnswer']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['submitAnswer']);
        TestBed.configureTestingModule({
            declarations: [GamePageQuestionsComponent, AppGamePageQuestionsStubComponent],
            providers: [
                { provide: AnswerStateService, useValue: answerStateServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(GamePageQuestionsComponent);
        component = fixture.componentInstance;
        component.question = 'Sample Question';
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

    it('should allow to choose answers with the keyboard', () => {
        spyOn(component, 'toggleAnswer');
        const eventAnswer = new KeyboardEvent('keypress', { key: '1' });
        component.buttonDetect(eventAnswer);
        expect(component.toggleAnswer).toHaveBeenCalledWith(0);
        const eventSubmit = new KeyboardEvent('keypress', { key: 'Enter' });
        spyOn(component, 'submitAnswer');
        component.buttonDetect(eventSubmit);
        expect(component.submitAnswer).toHaveBeenCalled();
    });

    it('should reset question and answer status on changes', () => {
        component.ngOnChanges({
            question: new SimpleChange(null, 'New question', false),
        });
        expect(component.selectedChoices.length).toBe(0);
        expect(component.answerIsLocked).toBe(false);
    });

    it('should lock the answer when submitAnswer is called', () => {
        expect(component.answerIsLocked).toBeFalse();

        component.submitAnswer();

        expect(component.answerIsLocked).toBeTrue();
        expect(answerStateServiceSpy.lockAnswer).toHaveBeenCalledWith(true);
    });

    it('should call resetAnswerState when choices change', () => {
        spyOn(component, 'resetAnswerState');
        const newChoices = [
            { text: 'Paris', isCorrect: true },
            { text: 'London', isCorrect: false },
        ];
        component.ngOnChanges({
            choices: new SimpleChange([], newChoices, false),
        });
        expect(component.resetAnswerState).toHaveBeenCalled();
    });
});
