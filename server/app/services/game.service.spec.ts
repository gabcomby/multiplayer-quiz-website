import gameModel from '@app/model/game.model';
import { GameService } from '@app/services/game.service';
import { expect } from 'chai';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';

describe('Game service', () => {
    let gameService: GameService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let createStub: SinonStub;

    const gameInstance = new gameModel({
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

    beforeEach(() => {
        sandbox = createSandbox();
        gameService = new GameService();
        findStub = sandbox.stub(gameModel, 'find');
        createStub = sandbox.stub(gameModel, 'create');
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
});
