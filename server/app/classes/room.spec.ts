import { Room } from '@app/classes/room'; // Update the import path according to your project structure
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
            // Transfer callbacks to the room-specific instance to simulate room-specific behavior
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
});
