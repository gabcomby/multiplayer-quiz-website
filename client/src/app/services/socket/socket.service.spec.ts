/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import type { Question } from '@app/interfaces/game';
import { SocketService } from './socket.service';
// eslint-disable-next-line -- It is a package name and should not be altered, or removed, or changed, eslint is cringe
import { Player } from '@app/interfaces/match';
// eslint-disable-next-line @typescript-eslint/naming-convention
import * as SocketIOClient from 'socket.io-client';

const TIMER_COUNTDOWN = 10;
const QUESTION_TIME_UPDATE = 10;
const GAME_DURATION = 10;
const date = new Date();

class MockSocket {
    callbacks: { [eventName: string]: (data: unknown) => void } = {};
    emit = jasmine.createSpy('emit');
    disconnect = jasmine.createSpy('disconnect');

    // eslint-disable-next-line complexity
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
        if (eventName === 'room-created') {
            callback('roomId');
        }
        if (eventName === 'playerlist-change') {
            callback([
                ['1234', { id: '123', name: 'alex', score: 123, bonus: 0 }],
                ['233', { id: '123', name: 'alex', score: 123, bonus: 0 }],
            ]);
        }
        if (eventName === 'playerleftlist-change') {
            callback([
                { id: '124', name: 'alex', score: 123, bonus: 0 },
                { id: '123', name: 'alex', score: 123, bonus: 0 },
            ]);
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
        if (eventName === 'room-test-created') {
            callback('room');
        }
        if (eventName === 'lobby-deleted') {
            callback('deleted');
        }
        if (eventName === 'room-joined') {
            callback('123');
        }
        if (eventName === 'chat-message') {
            callback({ text: '123', sender: '124', timestamp: '344' });
        }
        if (eventName === 'go-to-results') {
            callback([
                ['1234', { id: '123', name: 'alex', score: 123, bonus: 0 }],
                ['233', { id: '123', name: 'alex', score: 123, bonus: 0 }],
            ]);
        }
        if (eventName === 'panic-mode-enabled') {
            callback('enabled');
        }
        if (eventName === 'panic-mode-disabled') {
            callback('disabled');
        }

        if (eventName === 'system-message') {
            callback({
                text: 'System alert',
                sender: 'System',
                timestamp: date,
            });
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
    it('should connect when connect is called', () => {
        spyOn(SocketIOClient, 'io').and.returnValue(new MockSocket() as unknown as SocketIOClient.Socket);
        service.connect();
        expect(SocketIOClient.io).toHaveBeenCalled();
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
    it('should handle playerList on change', (done) => {
        const fakePlayer: Player = { id: '123', name: 'alex', score: 123, bonus: 0 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fakePlayerList: any = [
            ['1234', fakePlayer],
            ['233', fakePlayer],
        ];
        service.onPlayerListChange((playerList: [[string, Player]]) => {
            expect(playerList).toEqual(fakePlayerList);
            done();
        });
    });
    it('should playerList when player leave', (done) => {
        const fakeList = [
            { id: '124', name: 'alex', score: 123, bonus: 0 },
            { id: '123', name: 'alex', score: 123, bonus: 0 },
        ];
        service.onPlayerLeftListChange((playerList: Player[]) => {
            expect(playerList).toEqual(fakeList);
            done();
        });
    });
    it('should handle room creation', (done) => {
        const fakeRoom = 'roomId';
        service.onRoomCreated((roomId: string) => {
            expect(roomId).toEqual(fakeRoom);
            done();
        });
    });
    it('should emit "create-room" events', () => {
        service.createRoom('123');
        expect(mockSocket.emit).toHaveBeenCalledWith('create-room', '123');
    });
    it('should emit "create-room-test" events', () => {
        service.createRoomTest('123', { id: '124', name: 'alex', score: 123, bonus: 0 });
        expect(mockSocket.emit).toHaveBeenCalledWith('create-room-test', '123', { id: '124', name: 'alex', score: 123, bonus: 0 });
    });
    it('should handle room test creation', (done) => {
        const fakeRoom = 'room';
        service.onRoomTestCreated((gameTitle: string) => {
            expect(gameTitle).toEqual(fakeRoom);
            done();
        });
    });
    it('should emit "join-room" events', () => {
        service.joinRoom('123', { id: '124', name: 'alex', score: 123, bonus: 0 });
        expect(mockSocket.emit).toHaveBeenCalledWith('join-room', '123', { id: '124', name: 'alex', score: 123, bonus: 0 });
    });
    it('should emit "leave-room" events', () => {
        service.leaveRoom();
        expect(mockSocket.emit).toHaveBeenCalledWith('leave-room');
    });
    it('should handle lobby delete', (done) => {
        service.onLobbyDeleted(() => {
            done();
        });
        expect(mockSocket.on).toHaveBeenCalledWith('lobby-deleted', jasmine.any(Function));
    });
    it('should handle joining room', (done) => {
        const fakeRoom = '123';
        service.onRoomJoined((roomId: string) => {
            expect(roomId).toEqual(fakeRoom);
            done();
        });
    });
    it('should emit "chat-message" events', () => {
        service.sendMessageToServer('hello', 'john', '123');
        expect(mockSocket.emit).toHaveBeenCalledWith('chat-message', { message: 'hello', playerName: 'john', roomId: '123' });
    });
    it('should handle joining room', (done) => {
        const fakeData = { text: '123', sender: '124', timestamp: '344' };
        service.onChatMessage().subscribe((data) => {
            expect(data).toEqual(fakeData);
            done();
        });
    });
    it('should handle go to result', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fakeData: any = [
            ['1234', { id: '123', name: 'alex', score: 123, bonus: 0 }],
            ['233', { id: '123', name: 'alex', score: 123, bonus: 0 }],
        ];
        service.onGoToResult((playerList: [[string, Player]]) => {
            expect(playerList).toEqual(fakeData);
            done();
        });
    });
    it('should emit "pause-timer" when pauseTimer is called', () => {
        service.pauseTimer();
        expect(mockSocket.emit).toHaveBeenCalledWith('pause-timer');
    });
    it('should emit "enable-panic-mode" when enablePanicMode is called', () => {
        service.enablePanicMode();
        expect(mockSocket.emit).toHaveBeenCalledWith('enable-panic-mode');
    });
    it('should handle panic mode enabled', (done) => {
        service.onPanicModeEnabled(() => {
            done();
        });
        expect(mockSocket.on).toHaveBeenCalledWith('panic-mode-enabled', jasmine.any(Function));
    });
    it('should handle panic mode disabled', (done) => {
        service.onPanicModeDisabled(() => {
            done();
        });
        expect(mockSocket.on).toHaveBeenCalledWith('panic-mode-disabled', jasmine.any(Function));
    });
    it('should emit "update-histogram" when updateHistogram is called', () => {
        service.updateHistogram();
        expect(mockSocket.emit).toHaveBeenCalledWith('update-histogram');
    });
    it('should handle number modification and should call callback', (done) => {
        // eslint-disable-next-line no-unused-vars -- need it for the test
        service.onUpdateNbModified((nbModification: number) => {
            done();
        });
        expect(mockSocket.on).toHaveBeenCalledWith('number-modifications', jasmine.any(Function));
        mockSocket.simulateEvent('number-modifications', 1);
    });
    it('should handle locked answers QRL', (done) => {
        // eslint-disable-next-line no-unused-vars -- need it for the test
        service.onLockedAnswersQRL((answers: [string, [Player, string][]][]) => {
            done();
        });
        expect(mockSocket.on).toHaveBeenCalledWith('locked-answers-QRL', jasmine.any(Function));
        mockSocket.simulateEvent('locked-answers-QRL', ['123', [['123', '123']]]);
    });
    it('should handle a send-answers event', () => {
        service.sendAnswers([1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 });
        expect(mockSocket.emit).toHaveBeenCalledWith('send-answers', [1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 });
    });
    it('should handle a send-locked-answers event', () => {
        service.sendLockedAnswers([1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 });
        expect(mockSocket.emit).toHaveBeenCalledWith('send-locked-answers', [1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 });
    });
    it('should handle a send-live-answers event: true', () => {
        service.sendLiveAnswers([1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 }, true);
        expect(mockSocket.emit).toHaveBeenCalledWith('send-live-answers', [1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 }, true);
    });
    it('should handle a send-live-answers event: false', () => {
        service.sendLiveAnswers([1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 }, false);
        expect(mockSocket.emit).toHaveBeenCalledWith('send-live-answers', [1, 2, 3], { id: '123', name: 'alex', score: 123, bonus: 0 }, false);
    });
    it('should handle send message to server', () => {
        service.sendMessageToServer('hello', 'john', '123');
        expect(mockSocket.emit).toHaveBeenCalledWith('chat-message', { message: 'hello', playerName: 'john', roomId: '123' });
    });
    it('should update points in qrl', () => {
        const points = 5;
        const mockPoints: [Player, number][] = [[{ id: '123', name: 'alex', score: 123, bonus: 0 }, points]];
        service.updatePointsQRL(mockPoints);
        expect(mockSocket.emit).toHaveBeenCalledWith('update-points-QRL', [[{ id: '123', name: 'alex', score: 123, bonus: 0 }, points]]);
    });
    it('should handle "system-message" events', (done) => {
        const expectedSystemMessage = { text: 'System alert', sender: 'System', timestamp: date };
        mockSocket.simulateEvent('system-message', expectedSystemMessage);
        service.onSystemMessage().subscribe({
            next: (message) => {
                expect(message).toEqual(expectedSystemMessage);
                done();
            },
            error: done.fail,
        });
    });
});
