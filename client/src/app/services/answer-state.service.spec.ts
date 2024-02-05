import { TestBed } from '@angular/core/testing';

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

    it('should lock answer', () => {
        service.lockAnswer(true);
        service.answerLocked.subscribe((isLocked) => {
            expect(isLocked).toBeTrue();
        });
    });

    it('should unlock answer', () => {
        service.lockAnswer(false);
        service.answerLocked.subscribe((isLocked) => {
            expect(isLocked).toBeFalse();
        });
    });
});
