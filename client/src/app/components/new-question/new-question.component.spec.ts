import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Choice, Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import * as gameUtilsModule from '@app/utils/assign-new-game-attributes';
import { NewQuestionComponent } from './new-question.component';
import SpyObj = jasmine.SpyObj;

describe('NewQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let snackbarServiceMock: SpyObj<SnackbarService>;
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
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        TestBed.configureTestingModule({
            declarations: [NewQuestionComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: SnackbarService, useValue: snackbarServiceMock },
            ],
        });
        fixture = TestBed.createComponent(NewQuestionComponent);
        // snackbarService = TestBed.inject(SnackbarService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call addQuestion from service when question comes from a new game with valid data ', () => {
        spyOn(component, 'validateQuestion').and.returnValue(true);
        spyOn(component, 'resetComponent');
        spyOn(component, 'validateQuestionExisting').and.returnValue(Promise.resolve(true));
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const mockOnlyAddQuestionBank = false;
        component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
        expect(component.resetComponent).toHaveBeenCalled();
    });
    it('should call addQuestionBank when coming from the question bank with valid data', async () => {
        spyOn(component, 'validateQuestion').and.returnValue(true);
        spyOn(component, 'validateQuestionExisting').and.returnValue(Promise.resolve(true));
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const mockOnlyAddQuestionBank = true;
        component.addQuestion(newChoices, mockOnlyAddQuestionBank).then(() => {
            expect(questionServiceSpy.addQuestionBank).toHaveBeenCalled();
        });
    });
    it('should call addQuestion and addQuestionBank when coming from newGame and checkbox checked', async () => {
        spyOn(component, 'validateQuestion').and.returnValue(true);
        spyOn(component, 'resetComponent');
        spyOn(component, 'validateQuestionExisting').and.returnValue(Promise.resolve(true));
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const mockOnlyAddQuestionBank = false;
        component.addBankQuestion = true;
        await component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        expect(questionServiceSpy.addQuestionBank).toHaveBeenCalled();
        fixture.detectChanges();
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
        fixture.detectChanges();
        expect(component.resetComponent).toHaveBeenCalled();
    });
    it('should call addQuestion for every question selected when calling addQuestionFromBank', () => {
        const questionFromBank = [
            {
                type: 'QCM',
                text: 'Ceci est une question de test',
                points: 10,
                id: 'dsdsd',
                lastModification: new Date(),
            },
            {
                type: 'QCM',
                text: 'question 2',
                points: 10,
                id: 'alala',
                lastModification: new Date(),
            },
        ];
        component.addQuestionFromBank(questionFromBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalledWith(questionFromBank[0]);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalledWith(questionFromBank[1]);
    });
    it('should reset question component whe resetComponent is called', () => {
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        component.resetComponent(newChoices);
        expect(component.question).toEqual({
            text: '',
            points: 10,
            choices: [],
            type: 'QCM',
            id: '12312312',
            lastModification: defaultDate,
        });
        expect(newChoices[0]).toEqual({ isCorrect: false, text: '' });
        expect(newChoices[1]).toEqual({ isCorrect: false, text: '' });

        expect(component.addBankQuestion).toBeFalse();
    });
    it('should create question when createNewQuestion is called', () => {
        spyOn(gameUtilsModule, 'generateNewId').and.returnValue('334');
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const newQuestion = component.createNewQuestion(newChoices);
        expect(newQuestion).toEqual({
            text: 'allo',
            points: 10,
            choices: newChoices,
            type: 'QCM',
            id: '334',
            lastModification: new Date(),
        });
    });
    it('should return true when validateQuestion with valid data', () => {
        const newQuestion = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: [], lastModification: defaultDate };
        const valid = component.validateQuestion(newQuestion);
        expect(valid).toEqual(true);
    });
    it('should return false when validateQuestion with no text in question', () => {
        const newQuestion = { type: 'QCM', text: '', points: 10, id: '12312312', choices: [], lastModification: defaultDate };
        const valid = component.validateQuestion(newQuestion);
        expect(valid).toEqual(false);
    });
    it('should return false when validateQuestion with no points in question', () => {
        const newQuestion = { type: 'QCM', text: 'allo', points: 0, id: '12312312', choices: [], lastModification: defaultDate };
        const valid = component.validateQuestion(newQuestion);
        expect(valid).toEqual(false);
    });
    it('should return false when validateQuestion with just whitespaces in question text', () => {
        const newQuestion = { type: 'QCM', text: '   ', points: 10, id: '12312312', choices: [], lastModification: defaultDate };
        const valid = component.validateQuestion(newQuestion);
        expect(valid).toEqual(false);
    });
    it('should return false when calling validateQuestionExisting with question already in questionBank', async () => {
        const newQuestion = {
            type: 'QCM',
            text: 'Ceci est une question de test',
            points: 10,
            id: 'dsdsd',
            choice: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
            ],
            lastModification: new Date(),
        };
        const valid = await component.validateQuestionExisting(newQuestion);
        expect(valid).toEqual(false);
    });
    it('should return true when calling validateQuestionExisting with question not in questionBank', async () => {
        const newQuestion = {
            type: 'QCM',
            text: 'Ceci est une question de test 2',
            points: 10,
            id: '1234',
            choice: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
            ],
            lastModification: new Date(),
        };
        const valid = await component.validateQuestionExisting(newQuestion);
        expect(valid).toEqual(true);
    });
});
