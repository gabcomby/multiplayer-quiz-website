import { TestBed } from '@angular/core/testing';

import { TimerService } from './timer.service';

const FIVE = 5;

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start a timer', () => {
        service.startTimer(FIVE).subscribe((time) => {
            expect(time).toBeGreaterThanOrEqual(0);
        });
        service.killTimer();
    });

    it('should kill a timer', () => {
        service.killTimer();
        service.getCurrentTime().subscribe((time) => {
            expect(time).toEqual(0);
        });
    });

    it('should get the current time', () => {
        service.getCurrentTime().subscribe((time) => {
            expect(time).toEqual(0);
        });
        service.killTimer();
    });

    it('should not start a new timer if one is already running', () => {
        service.startTimer(FIVE).subscribe(() => {
            service.startTimer(FIVE).subscribe((time) => {
                expect(time).toEqual(0);
            });
        });
        service.killTimer();
    });
});
