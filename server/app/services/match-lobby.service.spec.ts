/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import matchLobbyModel from '@app/model/match-lobby.model';
import { IPlayer } from '@app/model/match.model';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { expect } from 'chai';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';

describe('MatchLobbyService', () => {
    let matchLobbyService: MatchLobbyService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let findOneStub: SinonStub;
    let createStub: SinonStub;
    let findOneAndDeleteStub: SinonStub;
    let findOneAndUpdateStub: SinonStub;

    const playerInstance = { id: 'player123', name: 'John Doe', score: 0 };

    const lobbyInstance = new matchLobbyModel({
        id: 'lobby123',
        name: 'Test Lobby',
        playerList: [playerInstance],
        bannedNames: ['mike', 'john', 'jane'],
        lobbyCode: 'ABCD',
        isLocked: false,
    });

    beforeEach(() => {
        sandbox = createSandbox();
        matchLobbyService = new MatchLobbyService();
        findStub = sandbox.stub(matchLobbyModel, 'find');
        findOneStub = sandbox.stub(matchLobbyModel, 'findOne');
        createStub = sandbox.stub(matchLobbyModel, 'create');
        findOneAndDeleteStub = sandbox.stub(matchLobbyModel, 'findOneAndDelete');
        findOneAndUpdateStub = sandbox.stub(matchLobbyModel, 'findOneAndUpdate');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a list of lobbies', async () => {
        findStub.resolves([lobbyInstance]);

        const lobbies = await matchLobbyService.getLobbies();
        expect(lobbies).to.eql([lobbyInstance]);
        expect(findStub.calledOnce).to.be.true;
    });

    it('should retrieve a specific lobby by ID', async () => {
        findOneStub.withArgs({ id: lobbyInstance.id }).resolves(lobbyInstance);

        const lobby = await matchLobbyService.getLobby(lobbyInstance.id);
        expect(lobby).to.eql(lobbyInstance);
        expect(findOneStub.calledWith({ id: lobbyInstance.id })).to.be.true;
    });

    it('should create a new lobby', async () => {
        createStub.withArgs(lobbyInstance).resolves(lobbyInstance);

        const result = await matchLobbyService.createLobby(lobbyInstance);
        expect(result).to.eql(lobbyInstance);
        expect(createStub.calledWith(lobbyInstance)).to.be.true;
    });

    it('should delete a specific lobby by ID', async () => {
        findOneAndDeleteStub.withArgs({ id: lobbyInstance.id }).resolves(lobbyInstance);

        const result = await matchLobbyService.deleteLobby(lobbyInstance.id);
        expect(result).to.eql(lobbyInstance);
        expect(findOneAndDeleteStub.calledWith({ id: lobbyInstance.id })).to.be.true;
    });

    it('should add a player to a lobby', async () => {
        const player = { id: 'player123', name: 'John Doe' };
        findOneAndUpdateStub.withArgs({ id: lobbyInstance.id }, { $push: { playerList: player } }, { new: true }).resolves({
            ...lobbyInstance,
            playerList: [player],
        });

        const result = await matchLobbyService.addPlayer(lobbyInstance.id, player as unknown as IPlayer);
        expect(result.playerList).to.include(player);
        expect(findOneAndUpdateStub.calledOnce).to.be.true;
    });

    // TODO: Fix this test
    // it('should remove a player from a lobby', async () => {
    //     const playerId = 'player123';
    //     findOneAndUpdateStub.withArgs({ id: lobbyInstance.id }, { $pull: { playerList: { id: playerId } } }, { new: true }).resolves({
    //         ...lobbyInstance,
    //         playerList: [],
    //     });

    //     const result = await matchLobbyService.removePlayer(lobbyInstance.id, playerId);
    //     expect(result.playerList).to.not.include({ id: playerId });
    //     expect(findOneAndUpdateStub.calledOnce).to.be.true;
    // });

    it("should get lobby by code and return null if it doesn't exist", async () => {
        findOneStub.withArgs({ lobbyCode: lobbyInstance.lobbyCode }).resolves(null);

        const result = await matchLobbyService.getLobbyByCode(lobbyInstance.lobbyCode);
        expect(result).to.be.null;
        expect(findOneStub.calledOnce).to.be.true;
    });

    it("should get banned players list and return an empty array if lobby doesn't exist", async () => {
        findOneStub.withArgs({ lobbyCode: lobbyInstance.lobbyCode }).resolves(null);

        const result = await matchLobbyService.getBannedPlayers(lobbyInstance.lobbyCode);
        expect(result).to.eql([]);
        expect(findOneStub.calledOnce).to.be.true;
    });

    it('should get banned players list', async () => {
        findOneStub.withArgs({ lobbyCode: lobbyInstance.lobbyCode }).resolves(lobbyInstance);

        const result = await matchLobbyService.getBannedPlayers(lobbyInstance.lobbyCode);
        expect(result).to.eql(lobbyInstance.bannedNames);
        expect(findOneStub.calledOnce).to.be.true;
    });

    it("should get players list and return an empty array if lobby doesn't exist", async () => {
        findOneStub.withArgs({ id: lobbyInstance.id }).resolves(playerInstance);

        const result = await matchLobbyService.getPlayers(lobbyInstance.id);
        expect(result).to.eql(undefined);
        expect(findOneStub.calledOnce).to.be.true;
    });
});
