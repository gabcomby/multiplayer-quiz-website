import { GameType, Room } from '@app/classes/room';
import gameModel from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { TimerState } from './countdown-timer';
import { DEFAULT_DELAY, SHORT_DELAY, TIME_BETWEEN_QUESTIONS_TEST_MODE } from 'config/server-config';

const mockGame = new gameModel({
    id: '1a2b3c',
    title: 'Questionnaire sur le JS',
    description: 'Questions de pratique sur le langage JavaScript',
    duration: 60,
    lastModification: new Date('2018-11-13T20:20:39+00:00'),
    questions: [
        {
            type: 'QCM',
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
            points: 40,
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
                {
                    text: 'int',
                },
            ],
        },
        {
            type: 'QRL',
            text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
            points: 60,
        },
        {
            type: 'QCM',
            text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
            points: 20,
            choices: [
                {
                    text: 'Non',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: null,
                },
            ],
        },
    ],
});

class MockSocketIO {
    // eslint-disable-next-line -- This is a stub
    callbacks: { [key: string]: (...args: any[]) => void } = {};
    rooms: { [roomId: string]: MockSocketIO } = {};

    emit = sinon.spy((event, ...args) => {
        if (this.callbacks[event]) {
            this.callbacks[event](...args);
        }
    });

    // eslint-disable-next-line -- This is a stub
    on(event: string, callback: any) {
        this.callbacks[event] = callback;
    }

    to(roomId: string) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = new MockSocketIO();
            this.rooms[roomId].callbacks = { ...this.callbacks };
        }
        return {
            emit: this.emit,
        };
    }

    // eslint-disable-next-line -- This is a stub
    simulate(event: string, ...args: any[]) {
        if (this.callbacks[event]) {
            (this.callbacks[event] as (...args: unknown[]) => void)(...args);
        }
    }
}

describe('CountdownTimer', () => {
    let room: Room;
    let mockSocketIoServer: MockSocketIO;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        mockSocketIoServer = new MockSocketIO();
        clock = sinon.useFakeTimers();
        room = new Room(mockGame, 0, mockSocketIoServer as unknown as SocketIO.Server);
    });

    afterEach(() => {
        sinon.restore();
        clock.restore();
    });

    it('should return the timer state', () => {
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        assert.equal(room.countdownTimer.timerStateValue, TimerState.RUNNING);
    });

    it('should return the launch timer state', () => {
        room.countdownTimer['isLaunchTimer'] = true;
        assert.equal(room.countdownTimer.isLaunchTimerValue, true);
    });

    it('should set the timer duration', () => {
        room.countdownTimer.timerDurationValue = 10;
        // eslint-disable-next-line
        assert.equal(room.countdownTimer['timerDuration'], 10);
    });

    it('should set the current question is QRL', () => {
        room.countdownTimer.currentQuestionIsQRLValue = true;
        assert.equal(room.countdownTimer['currentQuestionIsQRL'], true);
    });

    it('should start the countdown timer', () => {
        room.countdownTimer.timerDurationValue = 5;
        room.countdownTimer.startCountdownTimer();
        assert.equal(room.countdownTimer.timerStateValue, TimerState.RUNNING);
        // eslint-disable-next-line
        assert.equal(room.countdownTimer['currentCountdownTime'], 5);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', sinon.match.any);
    });

    it('should decrease the countdown time', () => {
        room.countdownTimer.timerDurationValue = 5;
        room.countdownTimer.startCountdownTimer();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', sinon.match.any);
        clock.tick(DEFAULT_DELAY);
        // eslint-disable-next-line
        assert.equal(room.countdownTimer['currentCountdownTime'], 4);
    });

    it('should not decrease the countdown time if the timer is paused', () => {
        room.countdownTimer.timerDurationValue = 5;
        room.countdownTimer.startCountdownTimer();
        room.countdownTimer['timerState'] = TimerState.PAUSED;
        clock.tick(DEFAULT_DELAY);
        // eslint-disable-next-line
        assert.equal(room.countdownTimer['currentCountdownTime'], 5);
    });

    it('should stop the countdown timer', () => {
        const disableFirstAnswerBonusSpy = sinon.spy(room, 'disableFirstAnswerBonus');
        const handleTimerEndSpy = sinon.spy(room.countdownTimer, 'handleTimerEnd');
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.timerDurationValue = 1;
        room.countdownTimer.startCountdownTimer();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', sinon.match.any);
        clock.tick(DEFAULT_DELAY);
        sinon.assert.calledOnce(disableFirstAnswerBonusSpy);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-stopped');
        sinon.assert.calledOnce(handleTimerEndSpy);
    });

    it('should not emit timer-stopped if the timer is a launch timer', () => {
        room.playerList = new Map([['test', { id: 'player1', score: 0, bonus: 0, name: 'Player 1' } as IPlayer]]);

        const disableFirstAnswerBonusSpy = sinon.spy(room, 'disableFirstAnswerBonus');
        const handleTimerEndSpy = sinon.spy(room.countdownTimer, 'handleTimerEnd');
        room.countdownTimer['isLaunchTimer'] = true;
        room.countdownTimer.timerDurationValue = 1;
        room.countdownTimer.startCountdownTimer();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', sinon.match.any);
        clock.tick(DEFAULT_DELAY);
        sinon.assert.calledOnce(disableFirstAnswerBonusSpy);
        sinon.assert.neverCalledWith(mockSocketIoServer.emit, 'timer-stopped');
        sinon.assert.calledOnce(handleTimerEndSpy);
    });

    it('should disable panic mode if enabled', () => {
        room.startQuestion = sinon.stub();
        room.countdownTimer['panicModeEnabled'] = true;
        room.countdownTimer.handleTimerEnd();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'panic-mode-disabled');
        assert.equal(room.countdownTimer['panicModeEnabled'], false);
        assert.equal(room.countdownTimer['timerDuration'], room.gameDurationValue);
        assert.equal(room.countdownTimer['timerState'], TimerState.STOPPED);
    });

    it('should start the next question if launch timer', () => {
        const startQuestionSpy = sinon.spy(room, 'startQuestion');
        room.countdownTimer['isLaunchTimer'] = true;
        room.countdownTimer.handleTimerEnd();
        sinon.assert.calledOnce(startQuestionSpy);
    });

    it('should automatically start the next question depending on game mode', () => {
        const startQuestionSpy = sinon.spy(room, 'startQuestion');
        room.gameType = GameType.TEST;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.handleTimerEnd();
        clock.tick(TIME_BETWEEN_QUESTIONS_TEST_MODE);
        sinon.assert.calledOnce(startQuestionSpy);
    });

    it('should handle timer pause when timer is running', () => {
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.countdownTimer.handleTimerPause();
        assert.equal(room.countdownTimer.timerStateValue, TimerState.PAUSED);
    });

    it('should handle timer pause when timer is paused', () => {
        room.countdownTimer['timerState'] = TimerState.PAUSED;
        room.countdownTimer.handleTimerPause();
        assert.equal(room.countdownTimer.timerStateValue, TimerState.RUNNING);
    });
    it('should do nothing pause when timer is stopped', () => {
        room.countdownTimer['timerState'] = TimerState.STOPPED;
        room.countdownTimer.handleTimerPause();
        assert.equal(room.countdownTimer.timerStateValue, TimerState.STOPPED);
    });

    it('should handle panic mode for QCM questions', () => {
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.countdownTimer['currentCountdownTime'] = 10;
        room.countdownTimer['currentQuestionIsQRL'] = false;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.handlePanicMode();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'panic-mode-enabled');
        assert.equal(room.countdownTimer['panicModeEnabled'], true);
    });

    it('should handle panic mode for QRL questions', () => {
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.countdownTimer['currentCountdownTime'] = 20;
        room.countdownTimer['currentQuestionIsQRL'] = true;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.handlePanicMode();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'panic-mode-enabled');
        assert.equal(room.countdownTimer['panicModeEnabled'], true);
    });

    it('should have a panic mode timer that decreases every quarter of a second', () => {
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.countdownTimer['currentCountdownTime'] = 10;
        room.countdownTimer['currentQuestionIsQRL'] = false;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.handlePanicMode();
        clock.tick(SHORT_DELAY);
        // eslint-disable-next-line
        assert.equal(room.countdownTimer['currentCountdownTime'], 9);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', sinon.match.any);
    });

    it('should stop the panic mode timer when the countdown time reaches 0', () => {
        const disableFirstAnswerBonusSpy = sinon.spy(room, 'disableFirstAnswerBonus');
        const handleTimerEndSpy = sinon.spy(room.countdownTimer, 'handleTimerEnd');
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.countdownTimer['currentCountdownTime'] = 1;
        room.countdownTimer['currentQuestionIsQRL'] = false;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.handlePanicMode();
        clock.tick(SHORT_DELAY);
        sinon.assert.calledOnce(disableFirstAnswerBonusSpy);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-stopped');
        sinon.assert.calledOnce(handleTimerEndSpy);
    });

    it('should not enable panic mode if the timer is paused', () => {
        room.countdownTimer['timerState'] = TimerState.PAUSED;
        room.countdownTimer['currentCountdownTime'] = 10;
        room.countdownTimer['currentQuestionIsQRL'] = false;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer.handlePanicMode();
        sinon.assert.neverCalledWith(mockSocketIoServer.emit, 'panic-mode-enabled');
    });

    it('should not decrease the countdown timer on panic mode if the timer is paused', () => {
        room.countdownTimer['currentCountdownTime'] = 10;
        room.countdownTimer['currentQuestionIsQRL'] = false;
        room.countdownTimer['isLaunchTimer'] = false;
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.countdownTimer.handlePanicMode();
        room.countdownTimer['timerState'] = TimerState.PAUSED;
        clock.tick(SHORT_DELAY);
        // eslint-disable-next-line
        assert.equal(room.countdownTimer['currentCountdownTime'], 10);
    });
});
