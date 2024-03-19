import { TestBed } from '@angular/core/testing';
import type { Question } from '@app/interfaces/game';
import { SocketService } from './socket.service';
// eslint-disable-next-line -- It is a package name and should not be altered, or removed, or changed, eslint is cringe
import * as SocketIOClient from 'socket.io-client';

const TIMER_COUNTDOWN = 10;
const QUESTION_TIME_UPDATE = 10;
const GAME_DURATION = 10;

class MockSocket {
    callbacks: { [eventName: string]: (data: unknown) => void } = {};
    emit = jasmine.createSpy('emit');
    disconnect = jasmine.createSpy('disconnect');

    on = jasmine.createSpy('on').and.callFake((eventName: string, callback) => {
        this.callbacks[eventName] = callback;

        if (eventName === 'timer-countdown') {
            callback(TIMER_COUNTDOWN);
        }

        if (eventName === 'room-lock-status') {
            callback(true);
        }

        if (eventName === 'question-time-updated') {
            callback(QUESTION_TIME_UPDATE);
        }

        if (eventName === 'question') {
            callback('question', 0);
        }

        if (eventName === 'livePlayerAnswers') {
            callback([
                ['player1', [1, 2, 3]],
                ['player2', [3, 2, 1]],
            ]);
        }

        if (eventName === 'game-started') {
            callback(GAME_DURATION);
        }
    });

    simulateEvent(eventName: string, ...args: unknown[]) {
        if (this.callbacks[eventName]) {
            this.callbacks[eventName]([...args]);
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

    it('should emit "ban-player" when banPlayer is called', () => {
        const playerName = 'player';
        service.banPlayer(playerName);
        expect(mockSocket.emit).toHaveBeenCalledWith('ban-player', playerName);
    });

    it('should handle "banned-from-game" events', (done) => {
        service.onBannedFromGame(() => {
            done();
        });

        mockSocket.simulateEvent('banned-from-game');
        expect(mockSocket.on).toHaveBeenCalledWith('banned-from-game', jasmine.any(Function));
    });

    it('should emit "toggle-room-lock" when toggleRoomLock is called', () => {
        service.toggleRoomLock();
        expect(mockSocket.emit).toHaveBeenCalledWith('toggle-room-lock');
    });

    it('should handle "room-lock-status" events', (done) => {
        service.onRoomLockStatus((isLocked: boolean) => {
            expect(isLocked).toBe(true);
            done();
        });
    });

    it('should emit "start-game" when startGame is called', () => {
        service.startGame();
        expect(mockSocket.emit).toHaveBeenCalledWith('start-game');
    });

    it('should handle "question-time-event" events', (done) => {
        service.onQuestionTimeUpdated((data: number) => {
            expect(data).toBe(QUESTION_TIME_UPDATE);
            done();
        });
    });

    it('should emit "timer-stopped" events', (done) => {
        service.onTimerStopped(() => {
            done();
        });

        mockSocket.simulateEvent('timer-stopped');
        expect(mockSocket.on).toHaveBeenCalledWith('timer-stopped', jasmine.any(Function));
    });

    it('should emit "next-question" events', () => {
        service.nextQuestion();
        expect(mockSocket.emit).toHaveBeenCalledWith('next-question');
    });

    it('should handle "send-answer" events', (done) => {
        service.sendAnswers([0]);
        expect(mockSocket.emit).toHaveBeenCalledWith('send-answers', [0]);
        done();
    });

    it('should handle "send-locked-answers events', (done) => {
        service.sendLockedAnswers([0]);
        expect(mockSocket.emit).toHaveBeenCalledWith('send-locked-answers', [0]);
        done();
    });

    it('should emit "send-live-answers" events', () => {
        service.sendLiveAnswers([0]);
        expect(mockSocket.emit).toHaveBeenCalledWith('send-live-answers', [0]);
    });

    it('should handle "livePlayerAnswers" events', (done) => {
        const fakeData: [string, number[]][] = [
            ['player1', [1, 2, 3]],
            ['player2', [3, 2, 1]],
        ];

        service.onLivePlayerAnswers((data: [string, number[]][]) => {
            expect(data).toEqual(fakeData);
            done();
        });
    });

    it('should handle "question" events', (done) => {
        const fakeQuestionIndex = 0;

        service.onQuestion((question: Question, questionIndex: number) => {
            expect(questionIndex).toBe(fakeQuestionIndex);
            done();
        });
    });

    it('should handle "game-started" events', (done) => {
        const fakeQuestionDuration = 10;

        service.onGameLaunch((questionDuration: number) => {
            expect(questionDuration).toBe(fakeQuestionDuration);
            done();
        });
    });
});
