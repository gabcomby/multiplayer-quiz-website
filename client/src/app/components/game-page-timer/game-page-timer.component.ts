import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TimerService } from '@app/services/timer.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-page-timer',
    templateUrl: './game-page-timer.component.html',
    styleUrls: ['./game-page-timer.component.scss'],
})
export class GamePageTimerComponent implements OnInit {
    @Input() gameTimer: number;
    @Output() timerComplete = new EventEmitter<void>();
    time: Observable<number>;
    timerIsInvisible: boolean = false;

    constructor(private readonly timerService: TimerService) {}

    get totalTime(): number {
        return this.gameTimer;
    }

    ngOnInit() {
        this.time = this.timerService.getCurrentTime();
    }
}
