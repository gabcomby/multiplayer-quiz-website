/* eslint-disable max-lines  -- it is a test file so it is normal to have a lot of lines */
import { GameType, Room } from '@app/classes/room';
import gameModel from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as SocketIO from 'socket.io';

// const ID_LOBBY_LENGTH = 4;
// const ID_GAME_PLAYED_LENGTH = 10;
// const LAUNCH_TIMER_DURATION = 5;
// const QRL_DURATION = 60;

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
                    text: 'lol',
                    isCorrect: false,
                },
                {
                    text: 'kek',
                    isCorrect: false,
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
                    text: 'Non aussi',
                    isCorrect: true,
                },
                {
                    text: 'Oui',
                    isCorrect: false,
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

    it('should get allAnswersGameResultsValue', () => {
        room.answerVerifier['allAnswersGameResults'].set('1', [1, 2, 3]);
        const fakeMap = new Map<string, number[]>();
        fakeMap.set('1', [1, 2, 3]);
        assert.deepEqual(room.answerVerifier.allAnswersGameResultsValue, fakeMap);
    });

    it('should get allAnswersForQRLValue', () => {
        room.answerVerifier['allAnswersForQRL'].set('1', [[{ id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer, 'answer']]);
        const fakeMap = new Map<string, [IPlayer, string][]>();
        fakeMap.set('1', [[{ id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer, 'answer']]);
        assert.deepEqual(room.answerVerifier.allAnswersForQRLValue, fakeMap);
    });

    it('should set firstAnswerForBonusValue', () => {
        room.answerVerifier['firstAnswerForBonus'] = false;
        room.answerVerifier.firstAnswerForBonusValue = true;
        assert.isTrue(room.answerVerifier['firstAnswerForBonus']);
    });

    it('should set nbrOfAssertedAnswersValue', () => {
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier.nbrOfAssertedAnswersValue = 1;
        assert.equal(room.answerVerifier['nbrOfAssertedAnswers'], 1);
    });

    it('should set playerHasAnsweredSetter', () => {
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.playerHasAnsweredSetter = new Map<string, boolean>([['1', true]]);
        assert.isTrue(room.answerVerifier['playerHasAnswered'].get('1'));
    });

    it('should not verify answers if answerIdx is not a string or an array', () => {
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', null, { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.isFalse(room.answerVerifier['playerHasAnswered'].get('1'));
    });

    it('should push the globalAnswersText if answerIdx is a string', () => {
        room.currentQuestionIndex = 0;
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', 'answer', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.equal(room.answerVerifier['nbrOfAssertedAnswers'], 1);
        assert.isTrue(room.answerVerifier['playerHasAnswered'].get('1'));
        assert.deepEqual(room.answerVerifier['globalAnswersText'], [[{ id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer, 'answer']]);
    });

    it('should increment the score of the player if the game is a test and the question is a QRL', () => {
        room.currentQuestionIndex = 1;
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', 'zozo', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        // eslint-disable-next-line
        assert.equal(room.playerListValue.get('1').score, 60);
    });

    it('should increment the score of a single answer QCM if the answer is correct', () => {
        room.currentQuestionIndex = 0;
        room.gameType = GameType.NORMAL;
        room.answerVerifier['globalAnswerIndex'] = [];
        room.answerVerifier['firstAnswerForBonus'] = true;
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.playerList.set('2', { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', [0], { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.equal(room.answerVerifier['globalAnswerIndex'][0], 0);
        // eslint-disable-next-line
        assert.equal(room.playerListValue.get('1').score, 48);
        assert.equal(room.playerListValue.get('1').bonus, 1);
    });

    it('should not increment the score of a single answer QCM if the answer is incorrect', () => {
        room.currentQuestionIndex = 0;
        room.gameType = GameType.NORMAL;
        room.answerVerifier['globalAnswerIndex'] = [];
        room.answerVerifier['firstAnswerForBonus'] = true;
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.playerList.set('2', { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', [1], { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.equal(room.answerVerifier['globalAnswerIndex'][0], 1);
        // eslint-disable-next-line
        assert.equal(room.playerListValue.get('1').score, 0);
        assert.equal(room.playerListValue.get('1').bonus, 0);
    });

    it('should increment the score of a multiple answer QCM if the answers are correct', () => {
        room.currentQuestionIndex = 2;
        room.gameType = GameType.NORMAL;
        room.answerVerifier['globalAnswerIndex'] = [];
        room.answerVerifier['firstAnswerForBonus'] = false;
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.playerList.set('2', { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', [0, 1], { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.equal(room.answerVerifier['globalAnswerIndex'][0], 0);
        assert.equal(room.answerVerifier['globalAnswerIndex'][1], 1);
        // eslint-disable-next-line
        assert.equal(room.playerListValue.get('1').score, 20);
        assert.equal(room.playerListValue.get('1').bonus, 0);
    });

    it('should not increment the score of a multiple answer QCM if there are not enough answers', () => {
        room.currentQuestionIndex = 2;
        room.gameType = GameType.NORMAL;
        room.answerVerifier['globalAnswerIndex'] = [];
        room.answerVerifier['firstAnswerForBonus'] = false;
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.playerList.set('2', { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', [0], { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.equal(room.answerVerifier['globalAnswerIndex'][0], 0);
        // eslint-disable-next-line
        assert.equal(room.playerListValue.get('1').score, 0);
        assert.equal(room.playerListValue.get('1').bonus, 0);
    });

    it('should not increment the score of a multiple answer QCM if the answers are incorrect', () => {
        room.currentQuestionIndex = 2;
        room.gameType = GameType.NORMAL;
        room.answerVerifier['globalAnswerIndex'] = [];
        room.answerVerifier['firstAnswerForBonus'] = false;
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.playerList.set('2', { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier.verifyAnswers('1', [0, 2], { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        assert.equal(room.answerVerifier['globalAnswerIndex'][0], 0);
        assert.equal(room.answerVerifier['globalAnswerIndex'][1], 2);
        // eslint-disable-next-line
        assert.equal(room.playerListValue.get('1').score, 0);
        assert.equal(room.playerListValue.get('1').bonus, 0);
    });

    it('should send a playerlist-change event when all players have answered a QRL question', () => {
        room.currentQuestionIndex = 0;
        room.gameType = GameType.NORMAL;
        room.answerVerifier['globalAnswerIndex'] = [];
        room.answerVerifier['nbrOfAssertedAnswers'] = 0;
        room.answerVerifier['playerHasAnswered'].set('1', false);
        room.answerVerifier['playerHasAnswered'].set('2', false);
        room.playerList.set('1', { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.playerList.set('2', { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier.verifyAnswers('1', [0], { id: '1', name: 'toto', score: 0, bonus: 0 } as IPlayer);
        room.answerVerifier.verifyAnswers('2', [1], { id: '2', name: 'titi', score: 0, bonus: 0 } as IPlayer);
        sinon.assert.calledWith(mockSocketIoServer.emit, 'playerlist-change', sinon.match.any);
        assert.deepEqual(room.answerVerifier['allAnswersForQCM'].get(mockGame.questions[0].text), [0, 1]);
        assert.deepEqual(room.answerVerifier['allAnswersGameResults'].get(mockGame.questions[0].text), [0, 1]);
        assert.equal(room.answerVerifier['globalAnswerIndex'].length, 0);
    });
});
