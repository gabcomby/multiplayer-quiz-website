/* eslint-disable max-lines  -- it is a test file so it is normal to have a lot of lines */
import { Room } from '@app/classes/room';
import gameModel from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import * as chai from 'chai';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as SocketIO from 'socket.io';

const ID_LOBBY_LENGTH = 4;
const FIRST_ANSWER_MULTIPLIER = 1.2;
const TIME_BETWEEN_QUESTIONS_TEST_MODE = 5000;
const ONE_SECOND_IN_MS = 1000;

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
    let isTestRoom: boolean;
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
        isTestRoom = true;
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

    it('should start the countdown timer for the first question if not already running', () => {
        room.isRunning = false;
        room.launchTimer = true;

        room.startQuestion();
        assert.isTrue(room.isRunning);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', sinon.match.any);
    });

    it('should not start the countdown timer for the first question if already running', () => {
        room.isRunning = true;
        room.launchTimer = true;

        room.startQuestion();
        sinon.assert.notCalled(mockSocketIoServer.emit);
    });

    it('should correctly verify player answers and update scores', () => {
        room.isRunning = true;
        room.currentQuestionIndex = 0;
        const playerId = 'testPlayerId';
        const player: IPlayer = { id: playerId, score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set(playerId, player);
        const correctAnswerIndex = [0];

        room.verifyAnswers(playerId, correctAnswerIndex);

        const expectedScore = mockGame.questions[0].points * FIRST_ANSWER_MULTIPLIER;
        assert.equal(room.playerList.get(playerId).score, expectedScore);
        assert.equal(room.playerList.get(playerId).bonus, 1);
    });

    it('should emit "question-time-updated" when launchTimer is true', () => {
        room.isRunning = true;
        room.launchTimer = true;

        room.handleTimerEnd();

        sinon.assert.calledWith(mockSocketIoServer.emit, 'question-time-updated', room.game.duration);
    });

    it('should schedule startQuestion call in a test room', () => {
        room.isTestRoom = true;
        room.launchTimer = false;

        room.handleTimerEnd();

        clock.tick(TIME_BETWEEN_QUESTIONS_TEST_MODE);
    });

    it('should not schedule startQuestion call in a non-test room', () => {
        room.isTestRoom = false;
        room.launchTimer = false;

        room.handleTimerEnd();

        clock.tick(TIME_BETWEEN_QUESTIONS_TEST_MODE);
    });

    it('should handle countdown and stop correctly in a test room', () => {
        room.isTestRoom = true;
        room.isRunning = false;
        room.launchTimer = false;
        room.currentQuestionIndex = 0;

        room.handleTimerEnd();

        clock.tick(TIME_BETWEEN_QUESTIONS_TEST_MODE);
        assert.equal(room.currentQuestionIndex, 1);
    });
    it('should handle answers for repeated answers', () => {
        const existingPlayerId = 'existingPlayerId';
        const player: IPlayer = { id: existingPlayerId, score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        const answerIdx = [0];
        room.playerList.set(existingPlayerId, player);
        room.playerHasAnswered.set(existingPlayerId, true);

        room.verifyAnswers(existingPlayerId, answerIdx);
        assert.isTrue(room.playerHasAnswered.get(existingPlayerId));
    });

    it('should handle multiple correct answers', () => {
        const playerId = 'playerWithMultipleAnswers';
        const player: IPlayer = { id: playerId, score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set(playerId, player);
        room.isRunning = true;
        room.currentQuestionIndex = 2;

        const answerIdx = [0, 1];
        room.verifyAnswers(playerId, answerIdx);
    });

    it('should lock the room and not start a new question if not a test room and after handling the end of a timer', () => {
        room.isTestRoom = false;
        room.isRunning = true;
        room.launchTimer = false;

        room.handleTimerEnd();

        assert.isFalse(room.isRunning);
    });

    it('should emit "go-to-results" when the last question is answered', () => {
        room.isRunning = false;
        room.launchTimer = false;
        room.currentQuestionIndex = room.game.questions.length - 1;

        room.startQuestion();

        sinon.assert.calledWithMatch(mockSocketIoServer.emit, 'go-to-results', sinon.match.any, sinon.match.any, sinon.match.any);
    });

    it('should reset playerHasAnswered to false for all players at the start of a new question', () => {
        const player1: IPlayer = { id: 'player1Id', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set('player1Id', player1);
        const player2: IPlayer = { id: 'player2Id', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set('player2Id', player2);
        room.playerHasAnswered.set('player1', true);
        room.playerHasAnswered.set('player2', true);
        room.isRunning = false;
        room.launchTimer = false;
        room.currentQuestionIndex = 0;

        room.startQuestion();

        assert.isFalse(room.playerHasAnswered.get('player1'), 'Player 1 should be reset to not have answered');
        assert.isFalse(room.playerHasAnswered.get('player2'), 'Player 2 should be reset to not have answered');
    });

    it('should reset livePlayerAnswers to an empty array for all players at the start of a new question', () => {
        const player1: IPlayer = { id: 'player1Id', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set('player1Id', player1);
        const player2: IPlayer = { id: 'player2Id', score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set('player2Id', player2);

        room.livePlayerAnswers.set('player1Id', [1, 2]);
        room.livePlayerAnswers.set('player2Id', [2, 3]);

        room.isRunning = false;
        room.launchTimer = false;
        room.currentQuestionIndex = 0;

        room.startQuestion();

        assert.deepEqual(room.livePlayerAnswers.get('player1Id'), [], "Player 1's livePlayerAnswers should be reset to an empty array");
        assert.deepEqual(room.livePlayerAnswers.get('player2Id'), [], "Player 2's livePlayerAnswers should be reset to an empty array");
    });

    it('should not update score or bonus for a player who submits no answer (empty array)', () => {
        const playerId = 'playerWithMultipleAnswers';
        const player: IPlayer = { id: playerId, score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set(player.id, player);
        const initialScore = player.score;
        const initialBonus = player.bonus;

        room.verifyAnswers(player.id, []);

        assert.equal(room.playerList.get(player.id).score, initialScore, 'Player score should not change');
        assert.equal(room.playerList.get(player.id).bonus, initialBonus, 'Player bonus should not change');

        assert.isTrue(room.playerHasAnswered.get(player.id), 'Player should be marked as having answered');
    });

    it('should not increase score for incorrect multiple-choice submission', () => {
        room.currentQuestionIndex = 0;
        const playerId = 'playerWithMultipleAnswers';
        const player: IPlayer = { id: playerId, score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set(player.id, player);

        room.playerHasAnswered.clear();
        room.livePlayerAnswers.clear();

        const correctAnswerIndexes = [0];
        const incorrectAnswerIndexes = [1];
        const submittedAnswerIndexes = correctAnswerIndexes.concat(incorrectAnswerIndexes);

        room.verifyAnswers(player.id, submittedAnswerIndexes);

        assert.equal(room.playerList.get(player.id).score, 0, 'Player score should not change due to incorrect submission');

        assert.isTrue(room.playerHasAnswered.get(player.id), 'Player should be marked as having answered');
    });

    it('should increase score for correct single-choice submission', () => {
        room.currentQuestionIndex = 0;
        const playerId = 'playerWithMultipleAnswers';
        const player: IPlayer = { id: playerId, score: 0, bonus: 0, name: 'testPlayer' } as IPlayer;
        room.playerList.set(player.id, player);

        room.playerHasAnswered.set(player.id, false);
        const answerIdx = [0];
        const initialScore = player.score;

        room.firstAnswerForBonus = false;
        room.verifyAnswers(player.id, answerIdx);

        const expectedScoreIncrease = mockGame.questions[0].points;
        assert.equal(
            room.playerList.get(player.id).score,
            initialScore + expectedScoreIncrease,
            'Player score should increase by the question points',
        );
    });

    it('should handle countdown timer correctly, emitting events and stopping at zero', () => {
        const duration = 5;
        room.duration = duration;
        room.roomId = 'testRoomId';
        room.firstAnswerForBonus = true;
        room.launchTimer = false;
        const handleTimerEndSpy = sinon.spy(room, 'handleTimerEnd');

        room.startCountdownTimer();

        for (let currentTime = duration - 1; currentTime >= 0; currentTime--) {
            clock.tick(ONE_SECOND_IN_MS);
            sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', currentTime);
        }

        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-stopped');
        sinon.assert.calledOnce(handleTimerEndSpy);
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
        room.isRunning = true;

        const verifyAnswersStub = sinon.stub(room, 'verifyAnswers');

        room.handleEarlyAnswers('player1Id', [0]);
        room.handleEarlyAnswers('player2Id', [1]);

        assert.equal(room.lockedAnswers, 2, 'All players have locked in answers');

        room.handleEarlyAnswers('player3Id', [1]);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-stopped');

        verifyAnswersStub.restore();
    });

    it('should not emit "playerlist-change" when not all players have answered', () => {
        room.playerList.set('player1', { id: 'player1', score: 0, bonus: 0, name: 'Player 1' } as IPlayer);
        room.playerList.set('player2', { id: 'player2', score: 0, bonus: 0, name: 'Player 2' } as IPlayer);
        room.currentQuestionIndex = 0;

        room.verifyAnswers('player1', [0]);

        sinon.assert.neverCalledWith(mockSocketIoServer.emit, 'playerlist-change');
    });

    it('should not emit "timer-stopped" immediately if countdown is active, despite launchTimer being false', () => {
        room.duration = 5;
        room.launchTimer = false;
        room.isRunning = true;

        room.startCountdownTimer();

        for (let currentTime = room.duration - 1; currentTime > 0; currentTime--) {
            clock.tick(ONE_SECOND_IN_MS);
            sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-countdown', currentTime);
        }

        sinon.assert.neverCalledWith(mockSocketIoServer.emit, 'timer-stopped');

        clock.tick(ONE_SECOND_IN_MS);

        sinon.assert.calledWith(mockSocketIoServer.emit, 'timer-stopped');
    });
});
