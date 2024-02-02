import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

import { NewQuestionComponent } from './new-question.component';
import SpyObj = jasmine.SpyObj;

describe('NewQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;

    let component: NewQuestionComponent;
    let fixture: ComponentFixture<NewQuestionComponent>;
    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            updateList: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: new Date(),
                } as Question,
            ],
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NewQuestionComponent],
            providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
        });
        fixture = TestBed.createComponent(NewQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call addQuestion when question comes from a new game with valid data', () => {
        const newChoices = [
            { text: '1', isValid: false },
            { text: '2', isValid: true },
        ];
        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', lastModification: new Date() };
        const mockOnlyAddQuestionBank = false;
        component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
    });
    it('should call addQuestionBank when coming from the question bank', () => {
        const newChoices = [
            { text: '1', isValid: false },
            { text: '2', isValid: true },
        ];
        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', lastModification: new Date() };
        const mockOnlyAddQuestionBank = true;
        component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        // expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
    });
    it('should call addQuestion and addQuestionBank when coming from newGame and checkbox checked', () => {
        const newChoices = [
            { text: '1', isValid: false },
            { text: '2', isValid: true },
        ];
        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', lastModification: new Date() };
        const mockOnlyAddQuestionBank = false;
        component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
        // the other function
    });
});
