import { Component, Input } from '@angular/core';
import { AnswerStateService } from '@app/services/answer-state.service';

@Component({
    selector: 'app-game-page-timer',
    templateUrl: './game-page-timer.component.html',
    styleUrls: ['./game-page-timer.component.scss'],
})
export class GamePageTimerComponent {
    @Input() timerCountdown: number;
    @Input() totalTimer: number;
    @Input() timerExpired: boolean;
    answerLocked: boolean = false;

    constructor(private answerStateService: AnswerStateService) {
        this.answerStateService.answerLocked.subscribe((isLocked) => {
            this.answerLocked = isLocked;
        });
    }
}
