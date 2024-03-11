// answer-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnswerStateService {
    answerLockedSource = new BehaviorSubject<boolean>(false);
    answerLocked = this.answerLockedSource.asObservable();

    lockAnswer(isLocked: boolean) {
        this.answerLockedSource.next(isLocked);
    }

    resetAnswerState() {
        this.answerLockedSource.next(false);
    }
}
