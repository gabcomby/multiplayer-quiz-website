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
        bannedNames: ['mike', 'john', 'jane'],
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

    it('should add a player to a lobby on PATCH /:id/players', async () => {
        matchLobbyService.addPlayer.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp)
            .patch(`/api/lobbies/${mockLobbyData.id}/players`)
            .send({ name: 'Player 1' })
            .expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should remove a player from a lobby on DELETE /:id/players/:playerId', async () => {
        matchLobbyService.removePlayer.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).delete(`/api/lobbies/${mockLobbyData.id}/players/123`).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should return all banned players on GET /:id/ban', async () => {
        matchLobbyService.getBannedPlayers.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).get(`/api/lobbies/${'ABCD'}/banned`).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should get lobby by code on GET /joinLobby/:code', async () => {
        matchLobbyService.getLobbyByCode.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).get(`/api/lobbies/joinLobby/${mockLobbyData.id}`).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should return an error status on GET /joinLobby/:code if service fails', async () => {
        matchLobbyService.getLobbyByCode.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get(`/api/lobbies/joinLobby/${mockLobbyData.id}`)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching lobby by code' });
            });
    });

    it('should return all players from lobby on GET /:id/players', async () => {
        matchLobbyService.getPlayers.resolves(mockLobbyData.toObject());

        const response = await supertest(expressApp).get(`/api/lobbies/${mockLobbyData.id}/players`).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockLobbyData)));
    });

    it('should return an error status on GET /:id/players if service fails', async () => {
        matchLobbyService.getPlayers.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get(`/api/lobbies/${mockLobbyData.id}/players`)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching players from lobby' });
            });
    });

    it('should return an error status on PATCH request if service fails', async () => {
        matchLobbyService.addPlayer.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .patch(`/api/lobbies/${mockLobbyData.id}/players`)
            .send({ name: 'Player 1' })
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error adding player to lobby' });
            });
    });

    it('should return an error status on GET request if service fails', async () => {
        matchLobbyService.getLobbies.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/lobbies')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching all lobbies from server' });
            });
    });

    it('should return an error status on GET request if service fails', async () => {
        matchLobbyService.getLobby.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get(`/api/lobbies/${mockLobbyData.id}`)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching lobby from server' });
            });
    });

    it('should return an error status on POST request if service fails', async () => {
        matchLobbyService.createLobby.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .post('/api/lobbies')
            .send({ name: 'New Lobby' })
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error creating lobby' });
            });
    });

    it('should return an error status on DELETE request if service fails', async () => {
        matchLobbyService.deleteLobby.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .delete(`/api/lobbies/${mockLobbyData.id}`)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error deleting lobby' });
            });
    });

    it('should return an error status on DELETE player request if service fails', async () => {
        matchLobbyService.removePlayer.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .delete(`/api/lobbies/${mockLobbyData.id}/players/123`)
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error removing player from lobby' });
            });
    });
});
