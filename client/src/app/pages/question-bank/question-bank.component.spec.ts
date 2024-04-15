import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { Question, QuestionType } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { QuestionBankComponent } from './question-bank.component';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionServiceMock: jasmine.SpyObj<QuestionService>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;

    const questionsMock: Question[] = [
        {
            id: 'abc123',
            type: QuestionType.QCM,
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
            type: QuestionType.QCM,
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
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
                MatDialogModule,
                MatTableModule,
                MatIconModule,
                MatMenuModule,
                MatToolbarModule,
            ],
            providers: [
                { provide: QuestionService, useValue: questionServiceMock },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
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
            { fromCreateNewGame: false, expectedColumns: component['defaultDisplayedColumns'] },
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
                type: QuestionType.QCM,
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
                type: QuestionType.QCM,
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
        component['questionToAdd'] = [questionsMock[0]];
        spyOn(component.registerQuestion, 'emit');

        component.addQuestionToGame();

        expect(component.registerQuestion.emit).toHaveBeenCalledWith([questionsMock[0]]);
        expect(component['questionToAdd'].length).toBe(0);
    });

    it('should handle selection change correctly', () => {
        component.onChange(questionsMock[0]);
        expect(component['questionToAdd']).toContain(questionsMock[0]);

        component.onChange(questionsMock[0]);
        expect(component['questionToAdd']).not.toContain(questionsMock[0]);
    });

    it('should filter questions by type', () => {
        component.dataSource = questionsMock;

        component.filter('QCM');
        expect(component.filteredQuestions.length).toBe(2);
        expect(component.filteredQuestions[0].type).toBe(QuestionType.QCM);

        component.filter('QRL');
        expect(component.filteredQuestions.length).toBe(0);

        component.filter();
        expect(component.filteredQuestions.length).toBe(questionsMock.length);
    });

    it('should format last modification date', () => {
        const dateStr = '2023-01-15T12:00:00.000Z';
        const formattedDate = component.formatDate(dateStr);

        expect(formattedDate).toBeDefined();
    });

    it('should update filteredQuestions after successful question deletion', async () => {
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component, 'deleteQuestion').and.callThrough();
        questionServiceMock.deleteQuestion.and.returnValue(Promise.resolve());

        component.deleteQuestion(questionsMock[0].id);
        await fixture.whenStable();

        expect(component.filteredQuestions.length).toBe(questionsMock.length - 2);
        expect(component.filteredQuestions).not.toContain(questionsMock[0]);
    });

    it('should display a success snackbar message after successful question deletion', async () => {
        component.dataSource = [
            {
                id: 'abc',
                type: QuestionType.QCM,
                text: 'question de test',
                points: 40,
                lastModification: new Date('2020-01-01'),
                choices: [
                    { text: 'Ceci est une question de test', isCorrect: true },
                    { text: 'Ceci est une question de test 2', isCorrect: false },
                ],
            },
        ];
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component, 'deleteQuestion').and.callThrough();
        questionServiceMock.deleteQuestion.and.returnValue(Promise.resolve());

        component.deleteQuestion(questionsMock[0].id);
        await fixture.whenStable();

        expect(snackbarServiceMock.openSnackBar).toHaveBeenCalledWith('Le jeu a été supprimé avec succès.');
    });
});
