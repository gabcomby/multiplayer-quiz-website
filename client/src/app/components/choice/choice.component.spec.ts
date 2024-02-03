import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { ChoiceComponent } from './choice.component';

const MAX_CHOICES = 4;

describe('ChoiceComponent', () => {
    let component: ChoiceComponent;
    let fixture: ComponentFixture<ChoiceComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChoiceComponent],
        });
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

        component.removeChoice(0);
        expect(component.answers.length).toBe(2);

        component.addChoice();
        expect(component.answers.length).toBe(3);

        component.addChoice();
        component.addChoice();
        expect(component.answers.length).toBe(MAX_CHOICES);
    });
    // IL PASSE

    it('should be able to add a choice', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        component.addChoice();
        expect(component.answers.length).toBe(3);
    });

    it('should be able to remove a choice', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
            { text: 'test3', isCorrect: false },
        ];

        component.removeChoice(1);
        expect(component.answers.length).toBe(2);
    });

    it('should move the answers in the array after the drop', () => {
        const event = {
            previousIndex: 1,
            currentIndex: 2,
        } as CdkDragDrop<Question[]>;

        component.answers = component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
            { text: 'test3', isCorrect: false },
        ];

        component.drop(event);

        expect(component.answers).toEqual([
            { text: 'test1', isCorrect: true },
            { text: 'test3', isCorrect: false },
            { text: 'test2', isCorrect: false },
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
