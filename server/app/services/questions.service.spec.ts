import questionsModel from '@app/model/questions.model';
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

    const questionInstance = new questionsModel({
        type: 'QCM',
        id: 'abc123',
        lastModification: new Date('2018-11-13T20:20:39+00:00'),
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
        findStub.returns([questionInstance]);
        const result = await questionsService.getQuestions();
        expect(result).to.eql([questionInstance]);
        expect(findStub.calledOnce);
    });

    it('should retrieve a question by its id', async () => {
        const questionId = 'abc123';
        findOneStub.withArgs({ id: questionId }).resolves(questionInstance);

        const game = await questionsService.getQuestionById(questionId);
        expect(game).to.eql(questionInstance);
        expect(findOneStub.calledWith({ id: questionId }));
    });

    it('should add a question to the bank', async () => {
        createStub.withArgs(questionInstance).resolves(questionInstance);
        const result = await questionsService.addQuestionBank(questionInstance);
        expect(result).to.eql(questionInstance);
        expect(createStub.calledOnce);
    });

    it('should delete a question', async () => {
        const questionId = 'abc123';
        findOneAndDeleteStub.withArgs({ id: questionId }).resolves(questionInstance);
        const result = await questionsService.deleteQuestion(questionId);
        expect(result).to.eql(questionInstance);
        expect(findOneAndDeleteStub.calledWith({ id: questionId }));
    });

    it('should update a question', async () => {
        const questionId = 'abc123';
        findOneAndUpdateStub.withArgs({ id: questionId }, questionInstance, { new: true }).resolves(questionInstance);
        const result = await questionsService.updateQuestion(questionId, questionInstance);
        expect(result).to.eql(questionInstance);
        expect(findOneAndUpdateStub.calledWith({ id: questionId }, questionInstance, { new: true }));
    });
});
