import { Application } from '@app/app';
import { IGamePlayed } from '@app/model/gameplayed.model';
import { GamePlayedService } from '@app/services/game-played/game-played.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GamePlayedController', () => {
    let gamePlayedService: SinonStubbedInstance<GamePlayedService>;
    let expressApp: Express.Application;

    const mockGamePlayedData = [
        {
            id: 'game123',
            title: 'Mock Game',
            bestScore: 5000,
            numberPlayers: 2,
            creationDate: new Date('2020-06-15T15:00:00Z'),
        } as IGamePlayed,
    ];

    beforeEach(async () => {
        gamePlayedService = createStubInstance(GamePlayedService);
        const app = Container.get(Application);
        Object.defineProperty(app['gamePlayedController'], 'gamePlayedService', { value: gamePlayedService, writable: true });
        expressApp = app.app;
    });

    it('should return a list of games on GET request', async () => {
        gamePlayedService.getGamesPlayed.resolves(mockGamePlayedData);

        const response = await supertest(expressApp).get('/api/games-played').expect(StatusCodes.OK);

        const expectedData = mockGamePlayedData.map((game) => ({
            ...game,
            creationDate: game.creationDate.toISOString(),
        }));

        chai.expect(response.body).to.deep.equal(expectedData);
    });

    it('should return an error status on GET request if service fails', async () => {
        gamePlayedService.getGamesPlayed.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/games-played')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching games' });
            });
    });

    it('should return a successful message on DELETE all games request', async () => {
        gamePlayedService.deletePlayedGames.resolves({ deletedCount: mockGamePlayedData.length });

        const response = await supertest(expressApp).delete('/api/games-played/deleteAllGamesPlayed').expect(StatusCodes.OK);

        chai.expect(response.text).to.equal(`Successfully deleted ${mockGamePlayedData.length} records.`);
    });

    it('should return an error status on DELETE request if service fails', async () => {
        gamePlayedService.deletePlayedGames.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .delete('/api/games-played/deleteAllGamesPlayed')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.text).to.equal('Internal Server Error');
            });
    });
});
