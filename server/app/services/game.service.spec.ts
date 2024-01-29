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
    let findOneAndUpdateStub: SinonStub;

    const gameInstance = new gameModel({
        id: '1a2b3c',
        title: 'Questionnaire sur le JS',
        isValid: true,
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

    beforeEach(() => {
        sandbox = createSandbox();
        gameService = new GameService();
        findStub = sandbox.stub(gameModel, 'find');
        findOneStub = sandbox.stub(gameModel, 'findOne');
        createStub = sandbox.stub(gameModel, 'create');
        findOneAndDeleteStub = sandbox.stub(gameModel, 'findOneAndDelete');
        findOneAndUpdateStub = sandbox.stub(gameModel, 'findOneAndUpdate');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a list of games', async () => {
        findStub.resolves([gameInstance]);

        const games = await gameService.getGames();
        expect(games).to.eql([gameInstance]);
        expect(findStub.calledOnce);
    });

    it('should create a new game', async () => {
        createStub.withArgs(gameInstance).resolves(gameInstance);

        const result = await gameService.createGame(gameInstance);
        expect(result).to.eql(gameInstance);
        expect(createStub.calledWith(gameInstance));
    });

    it('should retrieve a specific game', async () => {
        const gameId = '1a2b3c';
        findOneStub.withArgs({ id: gameId }).resolves(gameInstance);

        const game = await gameService.getGame(gameId);
        expect(game).to.eql(gameInstance);
        expect(findOneStub.calledWith({ id: gameId }));
    });

    it('should delete a specific game', async () => {
        const gameId = '1a2b3c';
        findOneAndDeleteStub.withArgs({ id: gameId }).resolves(gameInstance);

        const result = await gameService.deleteGame(gameId);
        expect(result).to.eql(gameInstance);
        expect(findOneAndDeleteStub.calledWith({ id: gameId }));
    });

    it('should toggle the visibility of a specific game', async () => {
        const gameId = '1a2b3c';
        const gameData = gameInstance;
        const updatedGame = { ...gameInstance, isVisible: true };

        findOneAndUpdateStub.withArgs({ id: gameId }, { $set: { isVisible: gameData.isVisible } }, { new: true }).resolves(updatedGame);

        const result = await gameService.toggleVisibility(gameId, gameData);
        expect(result).to.eql(updatedGame);
        expect(findOneAndUpdateStub.calledWith({ id: gameId }, { $set: { isVisible: gameData.isVisible } }, { new: true }));
    });

    it('should throw an error if the game to toggle visibility is not found', async () => {
        const gameId = '4d5e6f';
        const gameData = gameInstance;

        findOneAndUpdateStub.withArgs({ id: gameId }, { $set: { isVisible: gameData.isVisible } }, { new: true }).resolves(null);

        try {
            await gameService.toggleVisibility(gameId, gameData);
            expect.fail('Expected error was not thrown');
        } catch (e) {
            expect(e.message).to.equal('Game not found');
        }
        expect(findOneAndUpdateStub.calledWith({ id: gameId }, { $set: { isVisible: gameData.isVisible } }, { new: true }));
    });
});
