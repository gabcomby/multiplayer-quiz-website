import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { QuestionBankComponent } from './question-bank.component';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionServiceMock: jasmine.SpyObj<QuestionService>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;

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
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionServiceMock.getQuestions.and.returnValue(Promise.resolve(questionMock));
        questionServiceMock.deleteQuestion.and.returnValue(Promise.resolve());

        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: QuestionService, useValue: questionServiceMock },
                { provide: SnackbarService, useValue: snackbarServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getQuestions on init and load questions correctly', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        expect(questionServiceMock.getQuestions).toHaveBeenCalled();
        expect(component.dataSource).toEqual(questionMock);
    });

    it('should set displayedColumns based on fromCreateNewGame', () => {
        const testCases = [
            { fromCreateNewGame: true, expectedColumns: ['question', 'delete'] },
            { fromCreateNewGame: false, expectedColumns: component.defaultDisplayedColumns },
        ];

        testCases.forEach((testCase) => {
            component.fromCreateNewGame = testCase.fromCreateNewGame; // Arrange
            component.ngOnInit(); // Act
            expect(component.displayedColumns).toEqual(testCase.expectedColumns); // Assert
        });
    });

    it('should get the questions and sort them by date', async () => {
        const questionListMock: Question[] = [
            {
                id: 'abc123',
                type: 'QCM',
                text: 'question de test',
                points: 40,
                lastModification: new Date('2020-01-01'),
                choices: [
                    { text: 'Ceci est une question de test', isCorrect: true },
                    { text: 'Ceci est une question de test 2', isCorrect: false },
                ],
            },
            {
                id: 'abc124',
                type: 'QCM',
                text: 'question de test 2',
                points: 40,
                lastModification: new Date('2021-01-01'),
                choices: [
                    { text: 'Ceci est une question de test 3', isCorrect: true },
                    { text: 'Ceci est une question de test 4', isCorrect: false },
                ],
            },
        ];

        questionServiceMock.getQuestions.and.returnValue(Promise.resolve([questionListMock[0], questionListMock[1]]));

        component.loadQuestions();
        await fixture.whenStable();

        expect(questionServiceMock.getQuestions).toHaveBeenCalled();
        expect(component.dataSource).toEqual([questionListMock[1], questionListMock[0]]);
    });

    it('should delete a question and update dataSource upon confirmation', async () => {
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteQuestion(questionMock[0].id);
        await fixture.whenStable();

        expect(questionServiceMock.deleteQuestion).toHaveBeenCalledWith(questionMock[0].id);
        expect(snackbarServiceMock.openSnackBar).toHaveBeenCalledWith('Le jeu a été supprimé avec succès.');
    });

    it('should display an error message in the snackbar upon deletion failure', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const errorMessage = 'Deletion failed due to server error';
        questionServiceMock.deleteQuestion.and.returnValue(Promise.reject(errorMessage));

        component.deleteQuestion(questionMock[0].id);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(snackbarServiceMock.openSnackBar).toHaveBeenCalledWith(`Nous avons rencontré l'erreur suivante: ${errorMessage}`);
        });
    });

    it('should not delete a question nor show a snackbar message when deletion is cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteQuestion('abc123');

        expect(questionServiceMock.deleteQuestion).not.toHaveBeenCalled();

        expect(snackbarServiceMock.openSnackBar).not.toHaveBeenCalled();
    });

    it('should add a question to game and reset questionToAdd array', () => {
        component.questionToAdd = [questionMock[0]];
        spyOn(component.registerQuestion, 'emit');

        component.addQuestionToGame();

        expect(component.registerQuestion.emit).toHaveBeenCalledWith([questionMock[0]]);
        expect(component.questionToAdd.length).toBe(0);
    });

    it('should handle selection change correctly', () => {
        component.onChange(questionMock[0]);
        expect(component.questionToAdd).toContain(questionMock[0]);

        component.onChange(questionMock[0]);
        expect(component.questionToAdd).not.toContain(questionMock[0]);
    });
});
