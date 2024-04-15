/* eslint-disable max-lines  -- it is a test file so it is normal to have a lot of lines */
import { Room } from '@app/classes/room';
import gameModel from '@app/model/game.model';
import { IPlayer } from '@app/model/match.model';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as SocketIO from 'socket.io';
import { AnswerVerifier } from './answer-verifier';

const player = {
    id: 'testId',
    name: 'Test Player',
    score: 0,
    bonus: 0,
} as IPlayer;
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
    let clock: sinon.SinonFakeTimers;
    let answerVerifier: AnswerVerifier;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        mockSocketIoServer = new MockSocketIO();
    });

    afterEach(() => {
        sinon.restore();
        clock.restore();
    });

    before(() => {
        room = new Room(mockGame, 1, mockSocketIoServer as unknown as SocketIO.Server);
        room = sinon.createStubInstance(Room);
        it('should create an instance from the constructor', () => {
            expect(answerVerifier).to.be.instanceOf(AnswerVerifier);
        });
    });

    it('should have a room property', () => {
        answerVerifier = new AnswerVerifier(room);
        expect(answerVerifier).to.have.property('room');
    });
    it('should have a io property', () => {
        answerVerifier = new AnswerVerifier(room);
        expect(answerVerifier).to.have.property('io');
    });
    it('should be able to get the allAnswersGameResultsValue', () => {
        answerVerifier = new AnswerVerifier(room);
        expect(answerVerifier).to.have.property('allAnswersGameResultsValue');
    });
    it('should be able to get the allAnswersForQRLValue', () => {
        answerVerifier = new AnswerVerifier(room);
        expect(answerVerifier).to.have.property('allAnswersForQRLValue');
    });
    it('should be able to set the firstAnswerForBonusValue : true', () => {
        answerVerifier = new AnswerVerifier(room);
        const testValue = true;
        answerVerifier.firstAnswerForBonusValue = testValue;
        expect(testValue).to.equal(true);
        expect(answerVerifier).to.have.property('firstAnswerForBonusValue');
    });
    it('should be able to set the nbrOfAssertedAnswersValue', () => {
        answerVerifier = new AnswerVerifier(room);
        const testValue = 2;
        answerVerifier.nbrOfAssertedAnswersValue = testValue;
        expect(answerVerifier).to.have.property('nbrOfAssertedAnswersValue');
    });
    it('should be able to set the playerHasAnsweredSetter', () => {
        answerVerifier = new AnswerVerifier(room);
        const testValue = new Map<string, boolean>();
        answerVerifier.playerHasAnsweredSetter = testValue;
        expect(answerVerifier).to.have.property('playerHasAnsweredSetter');
    });
    it('should have a verifyAnswers method', () => {
        answerVerifier = new AnswerVerifier(room);
        expect(answerVerifier).to.have.property('verifyAnswers');
    });
    it('should return not return anything if the player has already answered', () => {
        answerVerifier = new AnswerVerifier(room);
        const playerId = '123';
        const answerIdx = '1';
        new Room(mockGame, 0, mockSocketIoServer as unknown as SocketIO.Server);
        answerVerifier['playerHasAnswered'].set(playerId, true);
        answerVerifier.verifyAnswers(playerId, answerIdx, player);
        expect(answerVerifier['playerHasAnswered'].get(playerId)).to.equal(true);
    });
    /* it('should increment the number of asserted answers', () => {
        const playerId = '123';
        const answerIdx = [1];
        const roomMock = new Room(mockGame, 0, mockSocketIoServer as unknown as SocketIO.Server);
        roomMock.currentQuestionIndex = 0;
        console.log('currentQuestionIndex');
        console.log(roomMock.currentQuestionIndex);
        console.log('currentQuestion');
        console.log(roomMock.currentQuestion);
        const answerVerifierGood = new AnswerVerifier(roomMock);
        answerVerifierGood.verifyAnswers(playerId, answerIdx, player);
    });*/
    it('should call the globalAnswersText.push method if the answer is a string', () => {
        const playerId = '123';
        const answerIdx = '1';
        const roomMock = new Room(mockGame, 1, mockSocketIoServer as unknown as SocketIO.Server);
        roomMock.currentQuestionIndex = 1;
        const answerVerifierGood = new AnswerVerifier(roomMock);
        answerVerifierGood.verifyAnswers(playerId, answerIdx, player);
        expect(answerVerifierGood['globalAnswersText']).to.have.lengthOf(1);
    });
    it('should call handleQCMAnswers if the question type is QCM', () => {
        const playerId = '123';
        const answerIdx = [1];
        const roomMock = new Room(mockGame, 0, mockSocketIoServer as unknown as SocketIO.Server);
        roomMock.currentQuestionIndex = 0;
        const answerVerifierGood = new AnswerVerifier(roomMock);
        const handleQCMAnswersSpy = sinon.spy(answerVerifierGood, 'handleQCMAnswers');
        answerVerifierGood.verifyAnswers(playerId, answerIdx, player);
        sinon.assert.calledOnce(handleQCMAnswersSpy);
    });
});
