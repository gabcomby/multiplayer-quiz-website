// answer-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnswerStateService {
    answerLockedSource = new BehaviorSubject<boolean>(false);
    answerLocked = this.answerLockedSource.asObservable();
    allLocked = 0;

    lockAnswer(isLocked: boolean) {
        this.answerLockedSource.next(isLocked);
    }
}
