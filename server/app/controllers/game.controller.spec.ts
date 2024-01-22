import { Application } from '@app/app';
import gameModel from '@app/model/game.model';
import { GameService } from '@app/services/game.service';
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

    it('should return an error status on GET request if service fails', async () => {
        gameService.getGames.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/games')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching games' });
            });
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
});
