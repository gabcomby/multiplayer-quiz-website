import questionsModel from '@app/model/questions.model';
import { QuestionsService } from '@app/services/questions.service';
import { SinonStubbedInstance } from 'sinon';

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
});
