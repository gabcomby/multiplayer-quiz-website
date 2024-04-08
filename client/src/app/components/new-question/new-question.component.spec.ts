import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Choice, Question, QuestionType } from '@app/interfaces/game';
import { HandlerNewQuestionService } from '@app/services/handler-new-question/handler-new-question.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { NewQuestionComponent } from './new-question.component';
import SpyObj = jasmine.SpyObj;

describe('NewQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let routerSpy: SpyObj<Router>;
    let snackbarServiceSpy: SpyObj<SnackbarService>;
    let questionValidationSpy: SpyObj<HandlerNewQuestionService>;
    let component: NewQuestionComponent;
    let fixture: ComponentFixture<NewQuestionComponent>;
    const defaultDate = new Date();

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            addQuestionBank: {},
            updateList: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                } as Question,
            ],
            getQuestions: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                } as Question,
            ],
        });
    });

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        questionValidationSpy = jasmine.createSpyObj('handlerQuestionService', ['addQuestion']);

        TestBed.configureTestingModule({
            declarations: [NewQuestionComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SnackbarService, useValue: snackbarServiceSpy },
                { provide: HandlerNewQuestionService, useValue: questionValidationSpy },
            ],
        });
        fixture = TestBed.createComponent(NewQuestionComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call addQuestion from service when addQuestion is called', () => {
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];
        component.addQuestion(false, newChoices);
        expect(questionValidationSpy.addQuestion).toHaveBeenCalled();
    });
    it('should call reset component if question is valid and not from question bank', async () => {
        spyOn(component, 'resetComponent');
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];
        questionValidationSpy.addQuestion.and.returnValue(Promise.resolve(true));

        await component.addQuestion(false, newChoices);
        expect(component.resetComponent).toHaveBeenCalled();
    });
    it('should call router navigate if question is valid and from question bank', async () => {
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];
        questionValidationSpy.addQuestion.and.returnValue(Promise.resolve(true));

        await component.addQuestion(true, newChoices);
        expect(routerSpy.navigate).toHaveBeenCalled();
    });
    it('should call nothing if question is not valid', () => {
        questionValidationSpy.addQuestion.and.returnValue(Promise.resolve(false));
        spyOn(component, 'resetComponent');
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];
        component.addQuestion(true, newChoices);
        expect(component.resetComponent).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should call addQuestion from service on every question selected of the bank', () => {
        const questionFromBank = [
            {
                type: QuestionType.QCM,
                text: 'Ceci est une question de test',
                points: 10,
                id: 'dsdsd',
                lastModification: new Date(),
                choices: [],
            },
            {
                type: QuestionType.QCM,
                text: 'question 2',
                points: 10,
                id: 'alala',
                lastModification: new Date(),
                choices: [],
            },
        ];
        component.addQuestionFromBank(questionFromBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
        expect(component.addFromQuestionBank).toBeFalsy();
    });

    it('should reset question component whe resetComponent is called', () => {
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: QuestionType.QCM, text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        component.resetComponent(newChoices);
        expect(component.question).toEqual({
            text: '',
            points: 10,
            choices: [],
            type: QuestionType.QCM,
            id: '12312312',
            lastModification: defaultDate,
        });
        expect(newChoices[0]).toEqual({ isCorrect: false, text: '' });
        expect(newChoices[1]).toEqual({ isCorrect: false, text: '' });

        expect(component.addBankQuestion).toBeFalse();
    });
});
