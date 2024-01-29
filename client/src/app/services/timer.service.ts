import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { finalize, takeWhile, tap } from 'rxjs/operators';

const ONE_SECOND_IN_MS = 1000;

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private initialTime: number;
    private currentTime: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private isRunning = false;

    startTimer(timeInSeconds: number): Observable<number> {
        if (this.isRunning) {
            return throwError(() => new Error('Timer is already running'));
        }

        this.initialTime = timeInSeconds;
        this.currentTime.next(this.initialTime);
        this.isRunning = true;

        return timer(0, ONE_SECOND_IN_MS).pipe(
            tap(() => {
                const newTime = this.currentTime.value - 1;
                this.currentTime.next(newTime);
            }),
            takeWhile(() => this.currentTime.value > 0),
            finalize(() => {
                this.isRunning = false;
            }),
        );
    }

    getCurrentTime(): Observable<number> {
        return this.currentTime.asObservable();
    }
}
