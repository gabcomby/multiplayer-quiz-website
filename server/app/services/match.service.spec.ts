import matchModel, { IPlayer } from '@app/model/match.model';
import { MatchService } from '@app/services/match.service';
import { expect } from 'chai';
import { SinonSandbox, SinonStub, createSandbox } from 'sinon';

describe('MatchService', () => {
    let matchService: MatchService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let findOneStub: SinonStub;
    let createStub: SinonStub;
    let findOneAndDeleteStub: SinonStub;
    let findOneAndUpdateStub: SinonStub;

    const matchInstance = new matchModel([
        {
            id: '1a2b3c',
            name: 'Test Match',
            players: [
                {
                    id: 'player1',
                    name: 'Test Player 1',
                    score: 0,
                },
                {
                    id: 'player2',
                    name: 'Test Player 2',
                    score: 0,
                },
            ],
        },
        {
            id: '4d5e6f',
            name: 'Test Match 2',
            players: [
                {
                    id: 'player3',
                    name: 'Test Player 3',
                    score: 0,
                },
                {
                    id: 'player4',
                    name: 'Test Player 4',
                    score: 0,
                },
            ],
        },
    ]);

    beforeEach(() => {
        sandbox = createSandbox();
        matchService = new MatchService();
        findStub = sandbox.stub(matchModel, 'find');
        findOneStub = sandbox.stub(matchModel, 'findOne');
        createStub = sandbox.stub(matchModel, 'create');
        findOneAndDeleteStub = sandbox.stub(matchModel, 'findOneAndDelete');
        findOneAndUpdateStub = sandbox.stub(matchModel, 'findOneAndUpdate');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a list of matches', async () => {
        findStub.resolves([matchInstance]);

        const matches = await matchService.getAllMatches();
        expect(matches).to.eql([matchInstance]);
        expect(findStub.calledOnce);
    });

    it('should create a new match', async () => {
        createStub.withArgs(matchInstance).resolves(matchInstance);

        const result = await matchService.createMatch(matchInstance);
        expect(result).to.eql(matchInstance);
        expect(createStub.calledWith(matchInstance));
    });

    it('should retrieve a specific match', async () => {
        const matchId = '1a2b3c';
        findOneStub.withArgs({ id: matchId }).resolves(matchInstance);

        const match = await matchService.getMatch(matchId);
        expect(match).to.eql(matchInstance);
        expect(findOneStub.calledWith({ id: matchId }));
    });

    it('should delete a specific match', async () => {
        const matchId = '1a2b3c';
        findOneAndDeleteStub.withArgs({ id: matchId }).resolves(matchInstance);

        const result = await matchService.deleteMatch(matchId);
        expect(result).to.eql(matchInstance);
        expect(findOneAndDeleteStub.calledWith({ id: matchId }));
    });

    it('should add a player to a match', async () => {
        const matchId = '1a2b3c';
        const player = {
            id: 'player5',
            name: 'Test Player 5',
        };
        findOneAndUpdateStub.withArgs({ id: matchId }, { $push: { players: player } }).resolves(matchInstance);

        const result = await matchService.addPlayer(matchId, player as IPlayer);
        expect(result).to.eql(matchInstance);
        expect(findOneAndUpdateStub.calledWith({ id: matchId }, { $push: { players: player } }));
    });

    it('should remove a player from a match', async () => {
        const matchId = '1a2b3c';
        const playerId = 'player1';
        findOneAndUpdateStub.withArgs({ id: matchId }, { $pull: { players: { id: playerId } } }).resolves(matchInstance);

        const result = await matchService.removePlayer(matchId, playerId);
        expect(result).to.eql(matchInstance);
        expect(findOneAndUpdateStub.calledWith({ id: matchId }, { $pull: { players: { id: playerId } } }));
    });

    it('should retrieve all players from a match', async () => {
        const matchId = '1a2b3c';
        findOneStub.withArgs({ id: matchId }).resolves(matchInstance);

        const players = await matchService.getAllPlayersFromMatch(matchId);
        expect(players).to.eql(matchInstance.playerList);
        expect(findOneStub.calledWith({ id: matchId }));
    });
});
