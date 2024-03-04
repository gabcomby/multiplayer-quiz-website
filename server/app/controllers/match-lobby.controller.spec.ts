import { Application } from '@app/app';
import matchModel from '@app/model/match.model';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('MatchLobbyController', () => {
    let matchLobbyService: SinonStubbedInstance<MatchLobbyService>;
    let expressApp: Express.Application;

    const mockLobbyData = new matchModel({
        id: 'lobby123',
        name: 'Test Lobby',
        playerList: [],
        bannedNames: [],
        lobbyCode: 'ABCD',
        isLocked: false,
    });

    beforeEach(() => {
        matchLobbyService = createStubInstance(MatchLobbyService);

        const app = Container.get(Application);
        Object.defineProperty(app['matchLobbyController'], 'matchLobbyService', { value: matchLobbyService, writable: true });

        expressApp = app.app;
    });

    it('should return all lobbies on GET /', async () => {
        matchLobbyService.getLobbies.resolves([mockLobbyData.toObject()]);

        const response = await supertest(expressApp).get('/api/lobbies').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal([JSON.parse(JSON.stringify(mockLobbyData))]);
    });

    it('should return a specific lobby on GET /:id', async () => {
        matchLobbyService.getLobby.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).get(`/api/lobbies/${mockLobbyData.id}`).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should create a lobby on POST /', async () => {
        matchLobbyService.createLobby.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).post('/api/lobbies').send({ name: 'New Lobby' }).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should delete a lobby on DELETE /:id', async () => {
        matchLobbyService.deleteLobby.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).delete(`/api/lobbies/${mockLobbyData.id}`).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });
});
