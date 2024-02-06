/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import gameModel from '@app/model/game.model';
import { GameService } from '@app/services/game.service';
import { expect } from 'chai';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';

describe('Game service', () => {
    let gameService: GameService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let findOneStub: SinonStub;
    let createStub: SinonStub;
    let findOneAndDeleteStub: SinonStub;

    const gameInstance = new gameModel({
        id: '1a2b3c',
        title: 'Questionnaire sur le JS',
        isValid: true,
        description: 'Questions de pratique sur le langage JavaScript',
        duration: 60,
        lastModification: new Date('2018-11-13T20:20:39+00:00'),
        questions: [
            {
                id: '1a2b3c4d',
                lastModification: new Date('2018-11-13T20:20:39+00:00'),
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
                        isCorrect: false,
                    },
                ],
            },
            {
                lastModification: new Date('2018-11-13T20:20:39+00:00'),
                id: '1a2b3c4d',
                type: 'QCM',
                text: 'Parmi les villes suivantes, laquelle est la capitale des États-Unis?',
                points: 40,
                choices: [
                    {
                        text: 'New York',
                        isCorrect: false,
                    },
                    {
                        text: 'Washington',
                        isCorrect: true,
                    },
                    {
                        text: 'San Francisco',
                        isCorrect: false,
                    },
                    {
                        text: 'Dallas',
                        isCorrect: false,
                    },
                ],
            },
            {
                lastModification: new Date('2018-11-13T20:20:39+00:00'),
                id: '1a2b3c4d',
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
                        isCorrect: false,
                    },
                ],
            },
        ],
    });

    beforeEach(() => {
        sandbox = createSandbox();
        gameService = new GameService();
        findStub = sandbox.stub(gameModel, 'find');
        findOneStub = sandbox.stub(gameModel, 'findOne');
        createStub = sandbox.stub(gameModel, 'create');
        findOneAndDeleteStub = sandbox.stub(gameModel, 'findOneAndDelete');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a list of games', async () => {
        findStub.resolves([gameInstance]);

        const games = await gameService.getGames();
        expect(games).to.eql([gameInstance]);
        expect(findStub.calledOnce).to.be.true;
    });

    it('should return an empty array if no games are found', async () => {
        findStub.resolves([]);

        const games = await gameService.getGames();
        expect(games).to.eql([]);
        expect(findStub.calledOnce).to.be.true;
    });

    it('should create a new game', async () => {
        createStub.withArgs(gameInstance).resolves(gameInstance);

        const result = await gameService.createGame(gameInstance);
        expect(result).to.eql(gameInstance);
        expect(createStub.calledWith(gameInstance)).to.be.true;
    });

    it('should retrieve a specific game', async () => {
        findOneStub.withArgs({ id: gameInstance.id }).resolves(gameInstance);

        const game = await gameService.getGame(gameInstance.id);
        expect(game).to.eql(gameInstance);
        expect(findOneStub.calledWith({ id: gameInstance.id })).to.be.true;
    });

    it('should return null if a specific game is not found', async () => {
        findOneStub.withArgs({ id: 'nonExistingId' }).resolves(null);

        const game = await gameService.getGame('nonExistingId');
        expect(game).to.be.null;
        expect(findOneStub.calledWith({ id: 'nonExistingId' })).to.be.true;
    });

    it('should delete a specific game', async () => {
        findOneAndDeleteStub.withArgs({ id: gameInstance.id }).resolves(gameInstance);

        const result = await gameService.deleteGame(gameInstance.id);
        expect(result).to.eql(gameInstance);
        expect(findOneAndDeleteStub.calledWith({ id: gameInstance.id })).to.be.true;
    });

    it('should return null if trying to delete a game that does not exist', async () => {
        findOneAndDeleteStub.withArgs({ id: 'nonExistingId' }).resolves(null);

        const result = await gameService.deleteGame('nonExistingId');
        expect(result).to.be.null;
        expect(findOneAndDeleteStub.calledWith({ id: 'nonExistingId' })).to.be.true;
    });
});
