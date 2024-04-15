import { Choice, Question, QuestionType } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { HandlerNewQuestionService } from './handler-new-question.service';

describe('HandlerNewQuestionService', () => {
    let handlerService: HandlerNewQuestionService;
    let questionService: jasmine.SpyObj<QuestionService>;
    let snackbarService: jasmine.SpyObj<SnackbarService>;
    let questionValidationService: jasmine.SpyObj<QuestionValidationService>;

    beforeEach(() => {
        questionService = jasmine.createSpyObj('QuestionService', ['addQuestionBank', 'addQuestion', 'getQuestions']);
        snackbarService = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationService = jasmine.createSpyObj('QuestionValidationService', ['validateQuestion']);

        handlerService = new HandlerNewQuestionService(snackbarService, questionValidationService, questionService);
    });

    const mockChoices: Choice[] = [
        { text: 'test1', isCorrect: false },
        { text: 'test2', isCorrect: true },
        { text: 'test3', isCorrect: false },
        { text: 'test4', isCorrect: false },
    ];

    const mockQuestion: Question = {
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
    };

    const mockQuestionList: Question[] = [
        {
            type: QuestionType.QCM,
            id: '123',
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

    it('should add question to bank and to list and return true', async () => {
        const onlyAddQuestionBank = false;
        const addToBank = true;
        questionValidationService.validateQuestion.and.returnValue(true);
        spyOn(handlerService, 'validateQuestionExisting').and.resolveTo(true);
        spyOn(handlerService, 'createNewQuestion').and.returnValue(mockQuestion);

        const result = await handlerService.addQuestion({
            question: mockQuestion,
            onlyAddQuestionBank,
            addToBank,
            choices: mockChoices,
        });

        expect(result).toBeTrue();
        expect(questionService.addQuestionBank).toHaveBeenCalled();
        expect(questionService.addQuestion).toHaveBeenCalled();
    });

    it('should add question to  only and return true', async () => {
        const onlyAddQuestionBank = false;
        const addToBank = false;
        questionValidationService.validateQuestion.and.returnValue(true);
        spyOn(handlerService, 'validateQuestionExisting').and.resolveTo(true);
        spyOn(handlerService, 'createNewQuestion').and.returnValue(mockQuestion);

        const result = await handlerService.addQuestion({
            question: mockQuestion,
            onlyAddQuestionBank,
            addToBank,
            choices: mockChoices,
        });

        expect(result).toBeTrue();
        expect(questionService.addQuestionBank).not.toHaveBeenCalled();
        expect(questionService.addQuestion).toHaveBeenCalled();
    });

    it('should return false if question already exists ', async () => {
        const onlyAddQuestionBank = false;
        const addToBank = true;
        questionValidationService.validateQuestion.and.returnValue(true);
        spyOn(handlerService, 'validateQuestionExisting').and.resolveTo(false);
        spyOn(handlerService, 'createNewQuestion').and.returnValue(mockQuestion);

        const result = await handlerService.addQuestion({
            question: mockQuestion,
            onlyAddQuestionBank,
            addToBank,
            choices: mockChoices,
        });
        expect(result).toBeFalse();
        expect(questionService.addQuestionBank).not.toHaveBeenCalled();
        expect(questionService.addQuestion).not.toHaveBeenCalled();
    });

    it('should return true if onlyAddQuestionBank is true and question doesnt already exist', async () => {
        const onlyAddQuestionBank = true;
        const addToBank = true;
        questionValidationService.validateQuestion.and.returnValue(true);
        spyOn(handlerService, 'validateQuestionExisting').and.resolveTo(true);
        spyOn(handlerService, 'createNewQuestion').and.returnValue(mockQuestion);

        const result = await handlerService.addQuestion({
            question: mockQuestion,
            onlyAddQuestionBank,
            addToBank,
            choices: mockChoices,
        });
        expect(result).toBeTrue();
        expect(questionService.addQuestionBank).toHaveBeenCalled();
        expect(questionService.addQuestion).not.toHaveBeenCalled();
    });

    it('should return false if onlyAddQuestionBank is true and question already exist', async () => {
        const onlyQuestionBank = true;
        const addBank = true;
        questionValidationService.validateQuestion.and.returnValue(true);
        spyOn(handlerService, 'validateQuestionExisting').and.resolveTo(false);
        spyOn(handlerService, 'createNewQuestion').and.returnValue(mockQuestion);

        const result = await handlerService.addQuestion({
            question: mockQuestion,
            onlyAddQuestionBank: onlyQuestionBank,
            addToBank: addBank,
            choices: mockChoices,
        });

        expect(result).toBeFalse();
        expect(questionService.addQuestionBank).not.toHaveBeenCalled();
        expect(questionService.addQuestion).not.toHaveBeenCalled();
    });

    it('should return false question is not validatedby questionValidationService', async () => {
        const onlyAddQuestionBank = true;
        const addToBank = true;
        questionValidationService.validateQuestion.and.returnValue(false);

        const result = await handlerService.addQuestion({
            question: mockQuestion,
            onlyAddQuestionBank,
            addToBank,
            choices: mockChoices,
        });

        expect(result).toBeFalse();
    });

    it('should show snackbar and return false when question already exists', async () => {
        questionValidationService.validateQuestion.and.returnValue(true);
        questionService.getQuestions.and.resolveTo(mockQuestionList);

        const result = await handlerService.validateQuestionExisting(mockQuestion);

        expect(result).toBeFalse();
        expect(snackbarService.openSnackBar).toHaveBeenCalled();
    });

    it('should not show snackbar and return true when question doesnt already exists', async () => {
        questionValidationService.validateQuestion.and.returnValue(true);
        questionService.getQuestions.and.resolveTo([]);

        const result = await handlerService.validateQuestionExisting(mockQuestion);

        expect(result).toBeTrue();
        expect(snackbarService.openSnackBar).not.toHaveBeenCalled();
    });
    it('should create a new question with choices undefined', () => {
        const question = handlerService.createNewQuestion(mockQuestion, undefined);
        expect(question.choices).toEqual(undefined);
    });
});
