import questionsModel from '@app/model/game.model';
import { QuestionsService } from '@app/services/questions.service';
import { expect } from 'chai';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';

describe('Game service', () => {
    let questionsService: QuestionsService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let findOneStub: SinonStub;
    let createStub: SinonStub;
    let findOneAndDeleteStub: SinonStub;
    let findOneAndUpdateStub: SinonStub;

    const questionsInstance = new questionsModel({
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
    });

    beforeEach(() => {
        questionsService = new QuestionsService();
        sandbox = createSandbox();
        findStub = sandbox.stub(questionsModel, 'find');
        findOneStub = sandbox.stub(questionsModel, 'findOne');
        createStub = sandbox.stub(questionsModel, 'create');
        findOneAndDeleteStub = sandbox.stub(questionsModel, 'findOneAndDelete');
        findOneAndUpdateStub = sandbox.stub(questionsModel, 'findOneAndUpdate');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a list of questions', async () => {
        findStub.returns([questionsInstance]);
        const result = await questionsService.getQuestions();
        expect(result).to.eql([questionsInstance]);
        expect(findStub.calledOnce);
    });
});
