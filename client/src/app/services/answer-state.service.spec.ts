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
});
