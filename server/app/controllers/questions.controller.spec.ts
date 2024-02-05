import { Application } from '@app/app';
import questionsModel from '@app/model/questions.model';
import { QuestionsService } from '@app/services/questions.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('QuestionsController', () => {
    let questionsService: SinonStubbedInstance<QuestionsService>;
    let expressApp: Express.Application;

    const mockQuestionData = new questionsModel({
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

    beforeEach(async () => {
        questionsService = createStubInstance(QuestionsService);
        const app = Container.get(Application);
        Object.defineProperty(app['questionsController'], 'questionsService', { value: questionsService, writable: true });
        expressApp = app.app;
    });

    it('should return an error status on GET request if service fails', async () => {
        questionsService.getQuestions.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/questions')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching games' });
            });
    });

    it('should return a list of questions on GET request', async () => {
        questionsService.getQuestions.resolves([mockQuestionData]);

        return supertest(expressApp)
            .get('/api/questions')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal([mockQuestionData]);
            });
    });

    it('should return an error status on GET request if service fails', async () => {
        questionsService.getQuestionById.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .get('/api/questions/abc123')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching question' });
            });
    });

    it('should return a question on GET request', async () => {
        questionsService.getQuestionById.resolves(mockQuestionData);

        return supertest(expressApp)
            .get('/api/questions/abc123')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(mockQuestionData);
            });
    });

    it('should return an error status on POST request if service fails', async () => {
        questionsService.addQuestionBank.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .post('/api/questions')
            .send(mockQuestionData)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error creating question' });
            });
    });

    it('should return a question on POST request', async () => {
        questionsService.addQuestionBank.resolves(mockQuestionData);

        return supertest(expressApp)
            .post('/api/questions')
            .send(mockQuestionData)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(mockQuestionData);
            });
    });

    it('should return an error status on DELETE request if service fails', async () => {
        questionsService.deleteQuestion.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .delete('/api/questions/abc123')
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error deleting question' });
            });
    });

    it('should return a question on DELETE request', async () => {
        questionsService.deleteQuestion.resolves(mockQuestionData);

        return supertest(expressApp)
            .delete('/api/questions/abc123')
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(mockQuestionData);
            });
    });

    it('should return an error status on PATCH request if service fails', async () => {
        questionsService.updateQuestion.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .patch('/api/questions/abc123')
            .send(mockQuestionData)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error updating question' });
            });
    });

    it('should return a question on PATCH request', async () => {
        questionsService.updateQuestion.resolves(mockQuestionData);

        return supertest(expressApp)
            .patch('/api/questions/abc123')
            .send(mockQuestionData)
            .expect(StatusCodes.OK)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(mockQuestionData);
            });
    });
});
