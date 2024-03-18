import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

import { AnswerStateService } from './answer-state.service';

describe('AnswerStateService', () => {
    let service: AnswerStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AnswerStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with answer unlocked', (done) => {
        service.answerLocked.pipe(take(1)).subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
            done();
        });
    });

    it('should lock answer', (done) => {
        service.lockAnswer(true);
        service.answerLocked.pipe(take(1)).subscribe((isLocked) => {
            expect(isLocked).toBeTrue();
            done();
        });
    });

    it('should unlock answer', (done) => {
        service.lockAnswer(true);

        service.lockAnswer(false);
        service.answerLocked.pipe(take(1)).subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
            done();
        });
    });

    it('should reset answer state to unlocked', (done) => {
        service.lockAnswer(true);

        service.resetAnswerState();
        service.answerLocked.pipe(take(1)).subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
            done();
        });
    });
});
