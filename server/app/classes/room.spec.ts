/* eslint-disable max-lines  -- it is a test file so it is normal to have a lot of lines */
import { GameType, Room } from '@app/classes/room';
import { ID_GAME_PLAYED_LENGTH, ID_LOBBY_LENGTH, LAUNCH_TIMER_DURATION, QRL_DURATION } from '@app/config/server-config';
import gameModel from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import * as chai from 'chai';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { TimerState } from './countdown-timer';

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

describe('Room', () => {
    let mockSocketIoServer: MockSocketIO;
    let room: Room;
    let isTestRoom: number;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        isTestRoom = 1;
        clock = sinon.useFakeTimers();
        mockSocketIoServer = new MockSocketIO();
        room = new Room(mockGame, isTestRoom, mockSocketIoServer as unknown as SocketIO.Server);
    });

    afterEach(() => {
        sinon.restore();
        clock.restore();
    });

    it('should generate a unique lobby ID', () => {
        const lobbyId = room.generateLobbyId();
        chai.expect(lobbyId).to.be.a('string');
        chai.expect(lobbyId.length).to.equal(ID_LOBBY_LENGTH);
    });

    it('should generate a unique game played ID', () => {
        const gamePlayedId = room.generateGamePlayedId();
        chai.expect(gamePlayedId).to.be.a('string');
        chai.expect(gamePlayedId.length).to.equal(ID_GAME_PLAYED_LENGTH);
    });

    it('should get the game type value', () => {
        assert.equal(room.gameTypeValue, isTestRoom);
    });

    it('should get the game duration', () => {
        assert.equal(room.gameDurationValue, mockGame.duration);
    });

    it('should get the current question', () => {
        room.currentQuestionIndex = 0;
        assert.equal(room.currentQuestion, mockGame.questions[0]);
    });

    it('should get the player list', () => {
        room.playerList.set('player1', { id: 'player1', score: 0, bonus: 0, name: 'Player 1' } as IPlayer);
        const playerList = new Map<string, IPlayer>();
        playerList.set('player1', { id: 'player1', score: 0, bonus: 0, name: 'Player 1' } as IPlayer);
        assert.deepEqual(room.playerListValue, playerList);
    });

    it('should set the timer duration to the launch timer duration and start the countdown timer', () => {
        room.countdownTimer['timerState'] = TimerState.STOPPED;
        room.countdownTimer['isLaunchTimer'] = true;
        const startCountdownTimerSpy = sinon.spy(room.countdownTimer, 'startCountdownTimer');
        room.startQuestion();
        assert.equal(room.countdownTimer['timerDuration'], LAUNCH_TIMER_DURATION);
        sinon.assert.calledOnce(startCountdownTimerSpy);
    });
    it('initialize gameType to random', () => {
        const game = new Room(mockGame, 2, room.io);
        assert.equal(game.gameType, GameType.RANDOM);
    });
    it('initialize gameType to normal', () => {
        const roomType = 55;
        const game = new Room(mockGame, roomType, room.io);
        assert.equal(game.gameType, GameType.NORMAL);
    });

    it('should call game result if end of the game', () => {
        const spy = sinon.spy(room, 'gameResult');
        room.gameType = GameType.TEST;
        room.countdownTimer['isLaunchTimer'] = false;
        room.currentQuestionIndex = mockGame.questions.length - 1;
        room.startQuestion();
        sinon.assert.called(spy);
        assert.equal(room.currentQuestionIndex, mockGame.questions.length);
    });
    it('should increment the current question index, send players to results page when and not write to db if test mode is enabled', () => {
        room.gameResult();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'go-to-results', sinon.match.any, sinon.match.any, sinon.match.any);
    });

    it('should increment the current question index, send players to results page when and write to db if test mode is disabled', () => {
        room.playerList = new Map([['test', { id: 'player1', score: 0, bonus: 0, name: 'Player 1' } as IPlayer]]);
        const createGamePlayedSpy = sinon.spy(room.gamePlayedService, 'createGamePlayed');
        room.gameType = GameType.NORMAL;
        room.countdownTimer['isLaunchTimer'] = false;
        room.currentQuestionIndex = mockGame.questions.length - 1;
        room.startQuestion();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'go-to-results', sinon.match.any, sinon.match.any, sinon.match.any);
        assert.equal(room.currentQuestionIndex, mockGame.questions.length);
        sinon.assert.calledWith(createGamePlayedSpy, sinon.match.any);
    });

    it('should set the timer duration to game time and set the current question as a QCM question', () => {
        room.playerHasAnswered = new Map([
            ['h', true],
            ['c', true],
        ]);
        room.livePlayerAnswers = new Map([
            ['h', 'he'],
            ['c', 'test'],
        ]);
        room.countdownTimer['timerState'] = TimerState.STOPPED;
        room.countdownTimer['isLaunchTimer'] = false;
        room.currentQuestionIndex = -1;
        room.startQuestion();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'question', sinon.match.any, sinon.match.any);
        assert.equal(room.countdownTimer['timerDuration'], room.game.duration);
        assert.isFalse(room.countdownTimer['currentQuestionIsQRL']);
    });

    it('should set the timer duration to 60 seconds and set the current question as a QRL question', () => {
        room.countdownTimer['timerState'] = TimerState.STOPPED;
        room.countdownTimer['isLaunchTimer'] = false;
        room.currentQuestionIndex = 0;
        room.startQuestion();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'question', sinon.match.any, sinon.match.any);
        assert.equal(room.countdownTimer['timerDuration'], QRL_DURATION);
        assert.isTrue(room.countdownTimer['currentQuestionIsQRL']);
    });
    it('should set the timer duration to gameDuration if no question', () => {
        room.countdownTimer['timerState'] = TimerState.STOPPED;
        room.countdownTimer['isLaunchTimer'] = false;
        room.currentQuestionIndex = 3;
        room.startQuestion();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'question', sinon.match.any, sinon.match.any);
        assert.equal(room.countdownTimer['timerDuration'], room.game.duration);
    });
    it('should do nothing if timerStateVAlue is not stopped', () => {
        room.countdownTimer['timerState'] = TimerState.RUNNING;
        room.startQuestion();
        sinon.assert.notCalled(mockSocketIoServer.emit);
    });

    it('should handle early answers correctly, emitting "timer-stopped" when all players have answered', () => {
        const player1Id = 'player1Id';
        const player2Id = 'player2Id';
        const player1 = { id: player1Id, score: 0, bonus: 0, name: 'Player 1' } as IPlayer;
        const player2 = { id: player2Id, score: 0, bonus: 0, name: 'Player 2' } as IPlayer;
        const player3 = { id: 'player3Id', score: 0, bonus: 0, name: 'Player 3' } as IPlayer;
        room.playerList.set(player1Id, player1);
        room.playerList.set(player2Id, player2);
        room.playerList.set('player3Id', player3);
        room.roomId = 'testRoomId';
        room.countdownTimer['timerState'] = TimerState.RUNNING;

        const handleTimerEndSpy = sinon.spy(room.countdownTimer, 'handleTimerEnd');
        const verifyAnswersStub = sinon.stub(room.answerVerifier, 'verifyAnswers');
        room.handleEarlyAnswers('player1Id', [0], player1);
        sinon.assert.calledWith(verifyAnswersStub, 'player1Id', [0], player1);
        room.handleEarlyAnswers('player2Id', [1], player1);
        sinon.assert.calledWith(verifyAnswersStub, 'player2Id', [1], player1);

        assert.equal(room.lockedAnswers, 2, 'All players have locked in answers');
        sinon.assert.notCalled(handleTimerEndSpy);

        room.handleEarlyAnswers('player3Id', [1], player1);
        sinon.assert.calledWith(verifyAnswersStub, 'player3Id', [1], player1);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-stopped');
        sinon.assert.calledOnce(handleTimerEndSpy);
    });
    it('should only count recent modifications and emit the correct number', () => {
        room.inputModifications = [
            { time: Date.now(), player: 'player1' },
            { time: Date.now(), player: 'player2' },
            { time: Date.now(), player: 'player3' },
        ];
        room.handleInputModification();
        sinon.assert.calledWith(mockSocketIoServer.emit, 'number-modifications');
    });
    it('should return if the current question is not a qrl', () => {
        room.currentQuestionIndex = 0;
        room.game.questions[room.currentQuestionIndex].type = 'QCM';
        room.handleInputModification();
        sinon.assert.notCalled(mockSocketIoServer.emit);
    });
});
