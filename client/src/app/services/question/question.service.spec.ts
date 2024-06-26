/* eslint-disable max-lines */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import { Question, QuestionType } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let httpController: HttpTestingController;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;
    let questionValidationServiceMock: jasmine.SpyObj<QuestionValidationService>;
    const defaultDate = new Date();

    const question: Question = {
        type: QuestionType.QCM,
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
                isCorrect: false,
            },
        ],
    };

    const mockQuestionList: Question[] = [
        {
            type: QuestionType.QCM,
            id: 'abc',
            lastModification: new Date('2018-11-13T20:20:39+00:00'),
            text: 'Test1',
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
            ],
        },
        {
            type: QuestionType.QCM,
            id: 'bcd',
            lastModification: new Date('2018-11-13T20:20:39+00:00'),
            text: 'Test2',
            points: 40,
            choices: [
                {
                    text: 'choice1',
                    isCorrect: true,
                },
                {
                    text: 'choice2',
                    isCorrect: false,
                },
            ],
        },
    ];

    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationServiceMock = jasmine.createSpyObj('QuestionValidationService', ['verifyOneGoodAndBadAnswer', 'validateQuestion']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                QuestionService,
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: QuestionValidationService, useValue: questionValidationServiceMock },
            ],
        });
        service = TestBed.inject(QuestionService);
        httpController = TestBed.inject(HttpTestingController);

        service.questions = [
            {
                id: 'string',
                type: QuestionType.QCM,
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
        service.questions = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all questions', () => {
        service.getQuestions().then((questions) => {
            expect(questions).toEqual([]);
        });

        const req = httpController.expectOne('http://localhost:3000/questions');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should add a question to the question bank', () => {
        service.addQuestionBank(question).then((newQuestion) => {
            expect(newQuestion).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/questions');
        expect(req.request.method).toBe('POST');
        req.flush(question);
    });
    it('should get a question by its id', () => {
        service.getQuestionById('abc123').subscribe((q) => {
            expect(q).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/questions/abc123');
        expect(req.request.method).toBe('GET');
        req.flush(question);
    });

    it('should update a question', () => {
        service.updateQuestion('abc123', question).then((updatedQuestion) => {
            expect(updatedQuestion).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/questions/abc123');
        expect(req.request.method).toBe('PATCH');
        req.flush(question);
    });

    it('should delete a question', () => {
        service.deleteQuestion('abc123');

        const req = httpController.expectOne('http://localhost:3000/questions/abc123');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should reset questions', () => {
        expect(service.questions.length).toBe(1);

        service.resetQuestions();

        expect(service.questions.length).toBe(0);
    });

    it('should add question', () => {
        service.addQuestion({
            id: 'string',
            type: QuestionType.QCM,
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

    it('should emit question after being added', () => {
        spyOn(service.onQuestionAdded, 'emit');
        const questionInstance = {
            id: 'string',
            type: QuestionType.QCM,
            text: 'string',
            points: 40,
            lastModification: defaultDate,
            choices: [
                { text: 'Ceci est une question de test', isCorrect: true },
                { text: 'Ceci est une question de test 2', isCorrect: false },
            ],
        };
        service.addQuestion(questionInstance);

        expect(service.onQuestionAdded.emit).toHaveBeenCalledWith(questionInstance);
    });

    it('should return the questions of the service', () => {
        const questions = service.getQuestion();

        expect(questions).toEqual(service.questions);
    });

    it('should update the question list with the question added', () => {
        const questions = [
            {
                id: 'string',
                type: QuestionType.QCM,
                text: 'string',
                points: 40,
                lastModification: new Date(),
                choices: [
                    { text: 'Ceci est une question de test', isCorrect: true },
                    { text: 'Ceci est une question de test 2', isCorrect: false },
                ],
            },

            {
                id: 'string1',
                type: QuestionType.QCM,
                text: 'string',
                points: 50,
                lastModification: new Date(),
                choices: [
                    { text: 'Ceci est une question de test3', isCorrect: true },
                    { text: 'Ceci est une question de test 4', isCorrect: false },
                ],
            },
        ];
        service.updateList(questions);
        expect(service.questions).toEqual(questions);
    });
    it('should save question when listQuestionBank is true and question is valid', () => {
        const index = 0;

        questionValidationServiceMock.verifyOneGoodAndBadAnswer.and.returnValue(true);
        questionValidationServiceMock.validateQuestion.and.returnValue(true);

        const result = service.saveQuestion(index, mockQuestionList, true);
        const req = httpController.expectOne('http://localhost:3000/questions/abc');

        expect(questionValidationServiceMock.verifyOneGoodAndBadAnswer).toHaveBeenCalled();
        expect(questionValidationServiceMock.validateQuestion).toHaveBeenCalled();
        expect(result).toBeTrue();
        expect(req.request.method).toEqual('PATCH');
        req.flush({});
    });
    it('should not save question and return false', () => {
        spyOn(service, 'saveQuestion').and.callThrough();
        const result = service.saveQuestion(3, mockQuestionList, false);
        expect(service.saveQuestion).toHaveBeenCalled();
        expect(result).toBeFalse();
    });

    it('should save question when valid', () => {
        const index = 0;

        questionValidationServiceMock.verifyOneGoodAndBadAnswer.and.returnValue(true);
        questionValidationServiceMock.validateQuestion.and.returnValue(true);

        const result = service.saveQuestion(index, mockQuestionList, false);

        expect(questionValidationServiceMock.verifyOneGoodAndBadAnswer).toHaveBeenCalled();
        expect(questionValidationServiceMock.validateQuestion).toHaveBeenCalled();
        expect(result).toBeTrue();
    });

    it('should switch the answer selected and the one on top', () => {
        const answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        service.moveQuestionUp(1, answers);
        expect(answers).toEqual([
            { text: 'test2', isCorrect: false },
            { text: 'test1', isCorrect: true },
            { text: 'test3', isCorrect: false },
        ]);
    });

    it('should not switch the answers if its the first choice', () => {
        const answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        service.moveQuestionUp(0, answers);
        expect(answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ]);
    });

    it('should switch the answer selected and the one underneath', () => {
        const answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        service.moveQuestionDown(1, answers);
        expect(answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test3', isCorrect: false },
            { text: 'test2', isCorrect: false },
        ]);
    });

    it('should not switch the answers if its the last choice', () => {
        const answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        service.moveQuestionDown(3, answers);
        expect(answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ]);
    });
});
