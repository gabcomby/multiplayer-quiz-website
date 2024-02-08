import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { QuestionBankComponent } from './question-bank.component';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionServiceMock: jasmine.SpyObj<QuestionService>;

    const questionMock: Question[] = [
        {
            id: 'abc123',
            type: 'QCM',
            text: 'question de test',
            points: 40,
            lastModification: new Date(),
            choices: [
                { text: 'Ceci est une question de test', isCorrect: true },
                { text: 'Ceci est une question de test 2', isCorrect: false },
            ],
        },
    ];

    beforeEach(async () => {
        questionServiceMock = jasmine.createSpyObj('QuestionService', ['getQuestions', 'deleteQuestion']);
        questionServiceMock.getQuestions.and.returnValue(Promise.resolve(questionMock));
        questionServiceMock.deleteQuestion.and.returnValue(Promise.resolve());

        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
            imports: [HttpClientTestingModule],
            providers: [{ provide: QuestionService, useValue: questionServiceMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getQuestions on init and load questions correctly', async () => {
        fixture.detectChanges(); // Trigger ngOnInit()
        await fixture.whenStable(); // Wait for async operations to complete

        expect(questionServiceMock.getQuestions).toHaveBeenCalled();
        expect(component.dataSource).toEqual(questionMock);
    });

    it('should delete a question and update dataSource', async () => {
        fixture.detectChanges();
        await fixture.whenStable(); // Ensure questions are loaded

        const initialLength = component.dataSource.length;
        component.deleteQuestion(questionMock[0].id);
        await fixture.whenStable(); // Wait for delete operation to complete

        expect(questionServiceMock.deleteQuestion).toHaveBeenCalledWith(questionMock[0].id);
        expect(component.dataSource.length).toBeLessThan(initialLength);
    });

    it('should add a question to game and reset questionToAdd array', () => {
        // Simulate user selecting a question to add
        component.questionToAdd = [questionMock[0]];
        spyOn(component.registerQuestion, 'emit');

        component.addQuestionToGame();

        expect(component.registerQuestion.emit).toHaveBeenCalledWith([questionMock[0]]);
        expect(component.questionToAdd.length).toBe(0); // Verify the array is reset
    });

    it('should handle selection change correctly', () => {
        // Simulate user selecting a question
        component.onChange(questionMock[0]);
        expect(component.questionToAdd).toContain(questionMock[0]);

        // Simulate user deselecting the same question
        component.onChange(questionMock[0]);
        expect(component.questionToAdd).not.toContain(questionMock[0]);
    });
});
