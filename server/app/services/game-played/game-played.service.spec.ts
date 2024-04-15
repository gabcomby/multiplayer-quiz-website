/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import gamePlayedModel, { IGamePlayed } from '@app/model/gameplayed.model';
import { GamePlayedService } from '@app/services/game-played/game-played.service';
import { expect } from 'chai';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';

describe('GamePlayedService', () => {
    let gamePlayedService: GamePlayedService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let createStub: SinonStub;
    let deleteManyStub: SinonStub;

    const gamePlayedInstance = {
        id: 'game123',
        title: 'Mock Game',
        bestScore: 5000,
        numberPlayers: 2,
        creationDate: new Date('2020-06-15T15:00:00Z'),
    } as IGamePlayed;

    beforeEach(() => {
        sandbox = createSandbox();
        gamePlayedService = new GamePlayedService();
        findStub = sandbox.stub(gamePlayedModel, 'find');
        createStub = sandbox.stub(gamePlayedModel, 'create');
        deleteManyStub = sandbox.stub(gamePlayedModel, 'deleteMany');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a list of played games', async () => {
        findStub.resolves([gamePlayedInstance]);

        const gamesPlayed = await gamePlayedService.getGamesPlayed();
        expect(gamesPlayed).to.eql([gamePlayedInstance]);
        expect(findStub.calledWith({}, { _id: 0 })).to.be.true;
    });

    it('should create a new played game record', async () => {
        createStub.withArgs(gamePlayedInstance).resolves(gamePlayedInstance);

        const result = await gamePlayedService.createGamePlayed(gamePlayedInstance);
        expect(result).to.eql(gamePlayedInstance);
        expect(createStub.calledWith(gamePlayedInstance)).to.be.true;
    });

    it('should delete all played game records', async () => {
        deleteManyStub.resolves({ deletedCount: 1 });

        const result = await gamePlayedService.deletePlayedGames();
        expect(result).to.eql({ deletedCount: 1 });
        expect(deleteManyStub.calledWith({})).to.be.true;
    });
});
