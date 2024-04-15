import { Application } from '@app/app';
import gameModel from '@app/model/game.model';
import { GameService } from '@app/services/game/game.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('GameController', () => {
    let gameService: SinonStubbedInstance<GameService>;
    let expressApp: Express.Application;

    const mockGameData = new gameModel({
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

    beforeEach(async () => {
        gameService = createStubInstance(GameService);

        const app = Container.get(Application);
        Object.defineProperty(app['gameController'], 'gameService', { value: gameService, writable: true });

        expressApp = app.app;
    });

    it('should return a list of questions on GET request', async () => {
        gameService.getGames.resolves([mockGameData.toObject()]);

        const response = await supertest(expressApp).get('/api/games').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal([JSON.parse(JSON.stringify(mockGameData))]);
    });

    it('should return an error status on GET request if service fails', async () => {
        gameService.getGames.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/games')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching games' });
            });
    });

    it('should create a game on POST request if service succeeds', async () => {
        gameService.createGame.resolves(mockGameData.toObject());

        const response = await supertest(expressApp).post('/api/games').send(mockGameData).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockGameData)));
    });

    it('should return an error status on POST request if service fails', async () => {
        gameService.createGame.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .post('/api/games')
            .send(mockGameData)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error creating game' });
            });
    });

    it('should delete a game on DELETE request if service succeeds', async () => {
        gameService.deleteGame.resolves(mockGameData.toObject());

        const response = await supertest(expressApp).delete('/api/games/1a2b3c').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockGameData)));
    });

    it('should return an error status on DELETE request if service fails', async () => {
        gameService.deleteGame.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .delete('/api/games/1a2b3c')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error deleting game' });
            });
    });

    it('should return a game on GET request if service succeeds', async () => {
        gameService.getGame.resolves(mockGameData.toObject());

        const response = await supertest(expressApp).get('/api/games/1a2b3c').expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockGameData)));
    });

    it('should return an error status on GET request if service fails', async () => {
        gameService.getGame.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/games/1a2b3c')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching game' });
            });
    });

    it('should update a game on PATCH request if service succeeds', async () => {
        gameService.updateGame.resolves(mockGameData.toObject());

        const response = await supertest(expressApp).patch('/api/games/1a2b3c').send(mockGameData).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(JSON.parse(JSON.stringify(mockGameData)));
    });

    it('should return an error status on PATCH request if service fails', async () => {
        const gameId = '1a2b3c';
        gameService.updateGame.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .patch(`/api/games/${gameId}`)
            .send({ isVisible: false })
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error updating game' });
            });
    });
});
