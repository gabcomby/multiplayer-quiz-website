import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let httpController: HttpTestingController;

    const question: Question = {
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
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuestionService],
        });
        service = TestBed.inject(QuestionService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all questions', () => {
        service.getQuestions().then((questions) => {
            expect(questions).toEqual([]);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should add a question to the question bank', () => {
        service.addQuestionBank(question).then((newQuestion) => {
            expect(newQuestion).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions');
        expect(req.request.method).toBe('POST');
        req.flush(question);
    });

    it('should get a question by its id', () => {
        service.getQuestionById('abc123').subscribe((q) => {
            expect(q).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions/abc123');
        expect(req.request.method).toBe('GET');
        req.flush(question);
    });

    it('should update a question', () => {
        service.updateQuestion('abc123', question).then((updatedQuestion) => {
            expect(updatedQuestion).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions/abc123');
        expect(req.request.method).toBe('PATCH');
        req.flush(question);
    });

    it('should delete a question', () => {
        service.deleteQuestion('abc123').then(() => {
            expect(service.questions).toEqual([]);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions/abc123');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
