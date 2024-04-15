import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MAX_QUESTIONS_CHOICES } from '@app/config/client-config';
import { QuestionValidationService } from '@app/services/question-validation/question-validation.service';
import { QuestionService } from '@app/services/question/question.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { ChoiceComponent } from './choice.component';

describe('ChoiceComponent', () => {
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let component: ChoiceComponent;
    let fixture: ComponentFixture<ChoiceComponent>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;
    let questionValidationSpy: jasmine.SpyObj<QuestionValidationService>;

    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationSpy = jasmine.createSpyObj('QuestionValidationService', ['answerValid', 'verifyOneGoodAndBadAnswer']);
        TestBed.configureTestingModule({
            declarations: [ChoiceComponent],
            providers: [
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: QuestionService, useValue: questionServiceSpy },
            ],
            imports: [MatDialogModule, MatCheckboxModule, MatIconModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize choices with the input question if exist', () => {
        component.question = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        component.ngOnInit();
        expect(component.choices).toEqual(component.question);
    });

    it('should add a choice if length of choices is lower than MAX_CHOICES', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        component.addChoice(component.answers);

        expect(component.answers.length).toBe(3);
    });

    it('should not add a choice if length of choices is MAX_CHOICES', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
            { text: 'test3', isCorrect: false },
            { text: 'test4', isCorrect: false },
        ];

        component.addChoice(component.answers);

        expect(component.answers.length).toBe(MAX_QUESTIONS_CHOICES);
        expect(snackbarServiceMock.openSnackBar).toHaveBeenCalledWith('Maximum 4 choix');
    });

    it('should have a minimum of 2 choices and a maximum of 4 choices', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        spyOn(component, 'addChoice').and.callFake(() => {
            if (component.answers.length < MAX_QUESTIONS_CHOICES) {
                component.answers.push({ text: 'test3', isCorrect: false });
            }
        });
        spyOn(component, 'removeChoice').and.callFake((index) => {
            if (component.answers.length > 2) {
                component.answers.splice(index, 1);
            }
        });

        expect(component.answers.length).toBe(2);

        component.removeChoice(0, component.answers);
        expect(component.answers.length).toBe(2);

        component.addChoice(component.answers);
        expect(component.answers.length).toBe(3);

        component.addChoice(component.answers);
        component.addChoice(component.answers);
        expect(component.answers.length).toBe(MAX_QUESTIONS_CHOICES);
    });

    it('should be able to remove a choice if length of choices is higher than 2', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
            { text: 'test3', isCorrect: false },
        ];

        component.removeChoice(1, component.answers);
        expect(component.answers.length).toBe(2);
    });

    it('should not be able to remove a choice if length of choices is 2 or lower', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        component.removeChoice(1, component.answers);
        expect(component.answers.length).toBe(2);
    });

    it('should emit registerAnswer event when there is at least one correct and one incorrect answer', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        questionValidationSpy.answerValid.and.returnValue(true);

        spyOn(component.registerAnswer, 'emit');
        component.ngOnInit();
        component.addAnswer();

        expect(component.registerAnswer.emit).toHaveBeenCalledWith(component.choices);
    });

    it('should not emit registerAnswer event when there is only good answers', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: true },
        ];
        questionValidationSpy.answerValid.and.returnValue(true);

        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).not.toHaveBeenCalledWith(component.answers);
    });

    it('should not emit registerAnswer event when there is only bad answers', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: false },
        ];
        questionValidationSpy.answerValid.and.returnValue(true);

        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).not.toHaveBeenCalledWith(component.answers);
    });

    it('should emit registerAnswer if all text attributes are not empty', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        questionValidationSpy.verifyOneGoodAndBadAnswer.and.returnValue(true);
        const registerSpy = spyOn(component.registerAnswer, 'emit');
        component.addAnswer();
        expect(registerSpy).toHaveBeenCalledWith(component.answers);
    });

    it('should return false if at least one text attributes is empty', () => {
        component.answers = [
            { text: '', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        questionValidationSpy.answerValid.and.returnValue(true);
        const registerSpy = spyOn(component.registerAnswer, 'emit');
        component.addAnswer();
        expect(registerSpy).not.toHaveBeenCalledWith(component.answers);
    });
});
