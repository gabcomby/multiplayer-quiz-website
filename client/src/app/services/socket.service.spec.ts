import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket.service';
// eslint-disable-next-line -- It is a package name and should not be altered, or removed, or changed, eslint is cringe
import * as SocketIOClient from 'socket.io-client';

const TIMER_COUNTDOWN = 10;

class MockSocket {
    callbacks: { [eventName: string]: (data: unknown) => void } = {};
    emit = jasmine.createSpy('emit');
    disconnect = jasmine.createSpy('disconnect');

    on = jasmine.createSpy('on').and.callFake((eventName: string, callback) => {
        this.callbacks[eventName] = callback;

        if (eventName === 'timer-countdown') {
            callback(TIMER_COUNTDOWN);
        }
        if (eventName === 'answer-verification') {
            callback(true);
        }
    });

    simulateEvent(eventName: string, data: unknown) {
        if (this.callbacks[eventName]) {
            this.callbacks[eventName](data);
        }
    }
}

describe('SocketService', () => {
    let service: SocketService;
    let mockSocket: MockSocket;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketService],
        });

        service = TestBed.inject(SocketService);

        mockSocket = new MockSocket();
        service['socket'] = mockSocket as unknown as SocketIOClient.Socket;
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should emit "start-timer" when startTimer is called', () => {
        service.startTimer();
        expect(mockSocket.emit).toHaveBeenCalledWith('start-timer');
    });

    it('should handle "timer-countdown" events', (done) => {
        service.onTimerCountdown((data: number) => {
            expect(data).toBe(TIMER_COUNTDOWN);
            done();
        });
    });

    it('should emit "stop-timer" when stopTimer is called', () => {
        service.stopTimer();
        expect(mockSocket.emit).toHaveBeenCalledWith('stop-timer');
    });

    it('should emit "set-timer-duration" when setTimerDuration is called', () => {
        const duration = 10;
        service.setTimerDuration(duration);
        expect(mockSocket.emit).toHaveBeenCalledWith('set-timer-duration', duration);
    });

    // TODO: These tests have to be changed according to the new answer verification system
    // it('should emit "assert-answers" when verifyAnswers is called', () => {
    //     const choices = [{ text: 'Choice 1', isCorrect: true }];
    //     const answerIdx = [0];
    //     service.verifyAnswers(choices, answerIdx, '123');
    //     expect(mockSocket.emit).toHaveBeenCalledWith('assert-answers', choices, answerIdx, '123');
    // });

    // it('should handle "answer-verification" events', (done) => {
    //     service.onAnswerVerification((data: boolean) => {
    //         expect(data).toBeTrue();
    //         done();
    //     });
    // });

    it('should emit "disconnect" when disconnect is called', () => {
        service.disconnect();
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });
});
