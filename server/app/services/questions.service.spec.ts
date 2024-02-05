import questionsModel from '@app/model/game.model';
import { QuestionsService } from '@app/services/questions.service';
import { SinonSandbox, SinonStub } from 'sinon';

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
});
