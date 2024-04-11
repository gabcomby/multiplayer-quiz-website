import { Room } from '@app/classes/room';
// import { IPlayer } from '@app/model/match.model';
import { AnswerVerifier } from './answer-verifier';
import { expect } from 'chai';
// import * as chai from 'chai';
// import { assert } from 'chai';
import * as sinon from 'sinon';
// import * as SocketIO from 'socket.io';

describe('AnswerVerifier', () => {
    let room: Room;
    let answerVerifier: AnswerVerifier;

    beforeEach(() => {
        room = sinon.createStubInstance(Room);
        answerVerifier = new AnswerVerifier(room);
    });

    it('should create an instance from the constructor', () => {
        expect(answerVerifier).to.be.instanceOf(AnswerVerifier);
    });
    it('should have a room property', () => {
        expect(answerVerifier).to.have.property('room');
    });
    it('should have a io property', () => {
        expect(answerVerifier).to.have.property('io');
    });
    it('should be able to get the allAnswersGameResultsValue', () => {
        expect(answerVerifier).to.have.property('allAnswersGameResultsValue');
    });
    it('should be able to get the allAnswersForQRLValue', () => {
        expect(answerVerifier).to.have.property('allAnswersForQRLValue');
    });
    it('should be able to set the firstAnswerForBonusValue : true', () => {
        const testValue = true;
        answerVerifier.firstAnswerForBonusValue = testValue;
        expect(testValue).to.equal(true);
        expect(answerVerifier).to.have.property('firstAnswerForBonusValue');
    });
    it('should be able to set the nbrOfAssertedAnswersValue', () => {
        const testValue = 2;
        answerVerifier.nbrOfAssertedAnswersValue = testValue;
        expect(answerVerifier).to.have.property('nbrOfAssertedAnswersValue');
    });
    it('should be able to set the playerHasAnsweredSetter', () => {
        const testValue = new Map<string, boolean>();
        answerVerifier.playerHasAnsweredSetter = testValue;
        expect(answerVerifier).to.have.property('playerHasAnsweredSetter');
    });
    it('should have a verifyAnswers method', () => {
        expect(answerVerifier).to.have.property('verifyAnswers');
    });
});
