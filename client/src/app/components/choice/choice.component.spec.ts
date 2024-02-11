import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnackbarService } from '@app/services/snackbar.service';
import { ChoiceComponent } from './choice.component';
// import { CdkDragDrop } from '@angular/cdk/drag-drop';
// import { Question } from '@app/interfaces/game';

const MAX_CHOICES = 4;

describe('ChoiceComponent', () => {
    let component: ChoiceComponent;
    let fixture: ComponentFixture<ChoiceComponent>;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;

    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        TestBed.configureTestingModule({
            declarations: [ChoiceComponent],
            providers: [{ provide: SnackbarService, useValue: snackbarServiceMock }],
        });
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

        expect(component.answers.length).toBe(MAX_CHOICES);
        expect(snackbarServiceMock.openSnackBar).toHaveBeenCalledWith('Maximum 4 choix');
    });

    it('should not add a choice if choices is undefined', () => {
        component.question = undefined;

        component.addChoice(component.question);

        expect(component.question).toBe(undefined);
        expect(snackbarServiceMock.openSnackBar).not.toHaveBeenCalledWith('Le jeu a été supprimé avec succès.');
    });
    it('should have a minimum of 2 choices and a maximum of 4 choices', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        spyOn(component, 'addChoice').and.callFake(() => {
            if (component.answers.length < MAX_CHOICES) {
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
        expect(component.answers.length).toBe(MAX_CHOICES);
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

    it('should switch the answer selected and the one on top', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        component.moveQuestionUp(1, component.answers);
        expect(component.answers).toEqual([
            { text: 'test2', isCorrect: false },
            { text: 'test1', isCorrect: true },
            { text: 'test3', isCorrect: false },
        ]);
    });

    it('should not switch the answers if its the first choice', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        component.moveQuestionUp(0, component.answers);
        expect(component.answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ]);
    });

    it('should switch the answer selected and the one underneath', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        component.moveQuestionDown(1, component.answers);
        expect(component.answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test3', isCorrect: false },
            { text: 'test2', isCorrect: false },
        ]);
    });

    it('should not switch the answers if its the last choice', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        component.moveQuestionDown(3, component.answers);
        expect(component.answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ]);
    });

    it('should emit registerAnswer event when there is at least one correct and one incorrect answer', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];

        spyOn(component, 'answerValid').and.returnValue(true);
        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).toHaveBeenCalledWith(component.answers);
    });

    it('should not emit registerAnswer event when there is only good answers', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: true },
        ];

        spyOn(component, 'answerValid').and.returnValue(false);
        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).not.toHaveBeenCalledWith(component.answers);
    });

    it('should not emit registerAnswer event when there is only bad answers', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: false },
        ];

        spyOn(component, 'answerValid').and.returnValue(false);
        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).not.toHaveBeenCalledWith(component.answers);
    });

    it('should return true if all text attributes are not empty', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        expect(component.answerValid(component.answers)).toBe(true);
    });

    it('should return false if at least one text attributes is empty', () => {
        component.answers = [
            { text: '', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        expect(component.answerValid(component.answers)).toBe(false);
    });
});
