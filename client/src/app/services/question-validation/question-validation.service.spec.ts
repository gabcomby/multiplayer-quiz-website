import { TestBed } from '@angular/core/testing';
import { Question, QuestionType } from '@app/interfaces/game';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { QuestionValidationService } from './question-validation.service';

describe('QuestionValidationService', () => {
    let service: QuestionValidationService;
    let snackbarSpy: jasmine.SpyObj<SnackbarService>;

    beforeEach(() => {
        snackbarSpy = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);

        TestBed.configureTestingModule({
            providers: [QuestionValidationService, { provide: SnackbarService, useValue: snackbarSpy }],
        });

        service = TestBed.inject(QuestionValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('answerValid', () => {
        it('should return true for valid answers', () => {
            const validAnswers = [{ text: 'Answer 1', isCorrect: true }];
            expect(service.answerValid(validAnswers)).toBeTrue();
            expect(snackbarSpy.openSnackBar).not.toHaveBeenCalled();
        });

        it('should return false and show snackbar for empty answer text', () => {
            const invalidAnswers = [{ text: '', isCorrect: false }];
            expect(service.answerValid(invalidAnswers)).toBeFalse();
            expect(snackbarSpy.openSnackBar).toHaveBeenCalledWith('tous les champs des choix de réponses doivent être remplis');
        });
    });

    describe('verifyOneGoodAndBadAnswer', () => {
        it('should return true if there is at least one correct and one incorrect answer', () => {
            const choices = [
                { text: 'Good', isCorrect: true },
                { text: 'Bad', isCorrect: false },
            ];
            expect(service.verifyOneGoodAndBadAnswer(choices)).toBeTrue();
        });

        it('should return false and show snackbar if all answers are either correct or incorrect', () => {
            const allCorrect = [
                { text: 'Good', isCorrect: true },
                { text: 'Also Good', isCorrect: true },
            ];
            expect(service.verifyOneGoodAndBadAnswer(allCorrect)).toBeFalse();
            expect(snackbarSpy.openSnackBar).toHaveBeenCalledWith('Au moins une bonne réponse et une mauvaise réponse');
        });
    });

    describe('validatePoints', () => {
        it('should return true for valid points', () => {
            const question = { text: 'Question', points: 20, choices: [] } as Partial<Question>;
            expect(service.validatePoints(question as Question)).toBeTrue();
        });

        it('should return false for invalid points', () => {
            const question = { text: 'Question', points: 5, choices: [] } as Partial<Question>;
            expect(service.validatePoints(question as Question)).toBeFalse();
        });
    });

    describe('validateQuestion', () => {
        it('should return true for a valid question', () => {
            const validQuestion = { text: 'Valid Question', points: 30, choices: [{ text: 'Answer 1', isCorrect: true }] } as Partial<Question>;
            spyOn(service, 'answerValid').and.returnValue(true);
            expect(service.validateQuestion(validQuestion as Question)).toBeTrue();
            expect(snackbarSpy.openSnackBar).not.toHaveBeenCalled();
        });

        it('should return false and show snackbar for an invalid question', () => {
            const invalidQuestion = { text: '', points: 30, choices: [{ text: 'Answer 1', isCorrect: true }] } as Partial<Question>;
            expect(service.validateQuestion(invalidQuestion as Question)).toBeFalse();
            expect(snackbarSpy.openSnackBar).toHaveBeenCalledWith(
                'la question a un besoin d un nom, de point (multiple de 10 entre 10 et 100) et pas juste des espaces',
            );
        });
        it('should return true for a valid QCM question and should call answer valid', () => {
            const validQuestion = {
                text: 'Valid Question',
                points: 30,
                choices: [{ text: 'Answer 1', isCorrect: true }],
                type: QuestionType.QCM,
            } as Partial<Question>;
            spyOn(service, 'answerValid').and.returnValue(true);
            expect(service.validateQuestion(validQuestion as Question)).toBeTrue();
            expect(snackbarSpy.openSnackBar).not.toHaveBeenCalled();
            expect(service.answerValid).toHaveBeenCalled();
        });
    });
});
