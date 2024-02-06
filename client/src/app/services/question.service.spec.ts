import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let httpController: HttpTestingController;
    const defaultDate = new Date();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuestionService],
        });
        service = TestBed.inject(QuestionService);
        httpController = TestBed.inject(HttpTestingController);

        service.questions = [
            {
                id: 'string',
                type: 'string',
                text: 'string',
                points: 40,
                lastModification: defaultDate,
                choices: [
                    { text: 'Ceci est une question de test', isCorrect: true },
                    { text: 'Ceci est une question de test 2', isCorrect: false },
                ],
            },
        ];
    });

    afterEach(() => {
        httpController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset questions', () => {
        expect(service.questions.length).toBe(1);

        service.resetQuestions();

        expect(service.questions.length).toBe(0);
    });

    it('should add question', () => {
        service.addQuestion({
            id: 'string',
            type: 'string',
            text: 'string',
            points: 40,
            lastModification: defaultDate,
            choices: [
                { text: 'Ceci est une question de test', isCorrect: true },
                { text: 'Ceci est une question de test 2', isCorrect: false },
            ],
        });

        expect(service.questions.length).toBe(2);
    });

    // it('shoudl emit question after being added' => {})
});
