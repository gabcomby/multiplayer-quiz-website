import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';

const ONE_SECOND_IN_MS = 1000;

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private initialTime: number;
    private currentTime: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private isRunning = false;

    startTimer(timeInSeconds: number): void {
        if (this.isRunning) {
            return;
        }

        this.initialTime = timeInSeconds;
        this.currentTime.next(this.initialTime);
        this.isRunning = true;

        timer(0, ONE_SECOND_IN_MS)
            .pipe(
                tap(() => {
                    const newTime = this.currentTime.value - 1;
                    this.currentTime.next(newTime);
                }),
                takeWhile(() => this.currentTime.value > 0),
            )
            .subscribe({
                complete: () => {
                    this.isRunning = false;
                },
            });
    }

    getCurrentTime(): Observable<number> {
        return this.currentTime.asObservable();
    }
}
