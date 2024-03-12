import { TestBed } from '@angular/core/testing';

import { HistogramService } from './histogram.service';

describe('HistogramService', () => {
    let service: HistogramService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HistogramService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
