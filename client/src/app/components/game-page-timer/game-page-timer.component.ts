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
    answerLocked: boolean = false;
    // @Input() gameTimer: number;
    // @Output() timerComplete = new EventEmitter<void>();
    // time: Observable<number>;
    // timerIsInvisible: boolean = false;
    // answerLocked: boolean = false;

    constructor(private answerStateService: AnswerStateService) {
        this.answerStateService.answerLocked.subscribe((isLocked) => {
            this.answerLocked = isLocked;
        });
    }

    // get totalTime(): number {
    //     return this.gameTimer;
    // }

    // ngOnInit() {
    //     this.time = this.timerService.getCurrentTime();
    // }
}
