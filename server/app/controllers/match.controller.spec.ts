import { Application } from '@app/app';
import matchModel from '@app/model/match.model';
import { MatchService } from '@app/services/match.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameController', () => {
    let matchService: SinonStubbedInstance<MatchService>;
    let expressApp: Express.Application;

    const mockGameData = new matchModel({
        id: '123abc',
        playerList: [
            {
                id: 'player1',
                name: 'Player 1',
                score: 100,
            },
            {
                id: 'player2',
                name: 'Player 2',
                score: 50,
            },
            {
                id: 'player3',
                name: 'Player 3',
                score: 100,
            },
        ],
    });

    beforeEach(async () => {
        matchService = createStubInstance(MatchService);

        const app = Container.get(Application);
        Object.defineProperty(app['matchController'], 'matchService', { value: matchService, writable: true });

        expressApp = app.app;
    });

    it('getAllMatches should return an error status on GET request if service fails', async () => {
        matchService.getAllMatches.rejects(new Error("Can't find matches to fetch"));

        return supertest(expressApp)
            .get('/api/matches')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't find matches to fetch" });
            });
    });

    it('getMatch should return an error status on GET request if service fails', async () => {
        matchService.getMatch.rejects(new Error("Can't find requested match"));

        return supertest(expressApp)
            .get('/api/matches/123abc')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't find requested match" });
            });
    });

    it('getAllPlayersFromMatch should return an error status on GET request if service fails', async () => {
        matchService.getAllMatches.rejects(new Error("Can't find players in requested match"));

        return supertest(expressApp)
            .get('/api/matches/123abc/players')
            .expect(StatusCodes.NOT_FOUND)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't find players in requested match" });
            });
    });

    it('createMatch should return an error status on POST request if service fails', async () => {
        matchService.createMatch.rejects(new Error("Can't create match"));

        return supertest(expressApp)
            .post('/api/matches')
            .send(mockGameData)
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't create match" });
            });
    });

    it('deleteMatch should return an error status on DELETE request if service fails', async () => {
        matchService.deleteMatch.rejects(new Error("Can't delete match"));

        return supertest(expressApp)
            .delete('/api/matches/123abc')
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't delete match" });
            });
    });

    it('addPlayer should return an error status on PATCH request if service fails', async () => {
        matchService.addPlayer.rejects(new Error("Can't add player to match"));

        return supertest(expressApp)
            .patch('/api/matches/123abc/players')
            .send({ id: 'a1b2c3', name: 'Test', score: 1000 })
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't add player to match" });
            });
    });

    it('removePlayer should return an error status on DELETE request if service fails', async () => {
        matchService.removePlayer.rejects(new Error("Can't remove player from match"));

        return supertest(expressApp)
            .delete('/api/matches/123abc/players/player1')
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: "Can't remove player from match" });
            });
    });
});
