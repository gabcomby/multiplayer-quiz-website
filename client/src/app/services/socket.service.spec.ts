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

    it('should handle "timer-countdown" events', (done) => {
        service.onTimerCountdown((data: number) => {
            expect(data).toBe(TIMER_COUNTDOWN);
            done();
        });
    });

    it('should emit "disconnect" when disconnect is called', () => {
        service.disconnect();
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });
});
