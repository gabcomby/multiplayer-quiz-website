import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnswerStateService } from '@app/services/answer-state.service';
import { GamePageTimerComponent } from './game-page-timer.component';

describe('GamePageTimerComponent', () => {
    let component: GamePageTimerComponent;
    let fixture: ComponentFixture<GamePageTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageTimerComponent],
            providers: [AnswerStateService],
            imports: [MatProgressSpinnerModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize answerLocked to false', () => {
        expect(component.answerLocked).toBeFalse();
    });
});
