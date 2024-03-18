import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { QuestionBankComponent } from './question-bank.component';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionServiceMock: jasmine.SpyObj<QuestionService>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;

    const questionsMock: Question[] = [
        {
            id: 'abc123',
            type: 'QCM',
            text: 'question de test',
            points: 40,
            lastModification: new Date('2021-01-01'),
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
            lastModification: new Date('2020-01-01'),
            choices: [
                { text: 'Ceci est une question de test 3', isCorrect: true },
                { text: 'Ceci est une question de test 4', isCorrect: false },
            ],
        },
    ];

    beforeEach(async () => {
        questionServiceMock = jasmine.createSpyObj('QuestionService', ['getQuestions', 'deleteQuestion']);
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionServiceMock.getQuestions.and.returnValue(Promise.resolve(questionsMock));

        await TestBed.configureTestingModule({
            declarations: [QuestionBankComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule, MatDialogModule, MatTableModule, MatIconModule],
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
        expect(component.dataSource).toEqual(questionsMock);
    });

    it('should set displayedColumns based on fromCreateNewGame', () => {
        const testCases = [
            { fromCreateNewGame: true, expectedColumns: ['question', 'delete'] },
            { fromCreateNewGame: false, expectedColumns: component.defaultDisplayedColumns },
        ];

        testCases.forEach((testCase) => {
            component.fromCreateNewGame = testCase.fromCreateNewGame;
            component.ngOnInit();
            expect(component.displayedColumns).toEqual(testCase.expectedColumns);
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

    it('should delete a question and update dataSource upon confirmation, ensuring dataSource.filter works as intended', async () => {
        spyOn(window, 'confirm').and.returnValue(true);
        component.dataSource = [...questionsMock];
        questionServiceMock.deleteQuestion.and.returnValue(Promise.resolve());
        expect(component.dataSource.length).toBe(2);
        expect(component.dataSource.some((question) => question.id === questionsMock[0].id)).toBe(true);

        component.deleteQuestion(questionsMock[0].id);
        await fixture.whenStable();

        expect(questionServiceMock.deleteQuestion).toHaveBeenCalledWith(questionsMock[0].id);
        expect(component.dataSource.some((question) => question.id === questionsMock[0].id)).toBe(false);
        expect(component.dataSource.length).toBe(1);
        expect(snackbarServiceMock.openSnackBar).toHaveBeenCalledWith('Le jeu a été supprimé avec succès.');
    });

    it('should display an error message in the snackbar upon deletion failure', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component, 'deleteQuestion').and.callThrough();
        const errorMessage = 'Deletion failed due to server error';
        questionServiceMock.deleteQuestion.and.returnValue(Promise.reject(errorMessage));

        component.deleteQuestion(questionsMock[0].id);
        tick();
        expect(snackbarServiceMock.openSnackBar).toHaveBeenCalled();
    }));

    it('should not delete a question nor show a snackbar message when deletion is cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteQuestion('abc123');

        expect(questionServiceMock.deleteQuestion).not.toHaveBeenCalled();

        expect(snackbarServiceMock.openSnackBar).not.toHaveBeenCalled();
    });

    it('should add a question to game and reset questionToAdd array', () => {
        component.questionToAdd = [questionsMock[0]];
        spyOn(component.registerQuestion, 'emit');

        component.addQuestionToGame();

        expect(component.registerQuestion.emit).toHaveBeenCalledWith([questionsMock[0]]);
        expect(component.questionToAdd.length).toBe(0);
    });

    it('should handle selection change correctly', () => {
        component.onChange(questionsMock[0]);
        expect(component.questionToAdd).toContain(questionsMock[0]);

        component.onChange(questionsMock[0]);
        expect(component.questionToAdd).not.toContain(questionsMock[0]);
    });
});
