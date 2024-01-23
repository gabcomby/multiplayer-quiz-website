import { Component } from '@angular/core';
import { TimeService } from '@app/services/time.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-game-page-timer',
    templateUrl: './game-page-timer.component.html',
    styleUrls: ['./game-page-timer.component.scss'],
})
export class GamePageTimerComponent {
    private readonly timer = 5;
    private readonly percentage = 100;
    constructor(private readonly timeService: TimeService) {}

    get time(): number {
        return this.timeService.time;
    }

    get timePercentage(): number {
        return (this.timeService.time / this.timer) * this.percentage;
    }

    handleOnTimerClick(): void {
        this.timeService.startTimer(this.timer);
    }
}
