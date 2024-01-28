import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Choice, Question } from '@app/interfaces/game';
@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    @Input() questionString: string;
    @Output() buttonClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() registerAnswer: EventEmitter<Choice[]> = new EventEmitter();
    type: string = '0';
    answers: Choice[] = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ];

    addChoice() {
        if (this.answers.length >= 2 && this.answers.length < 4) {
            this.answers.push({ text: '', isCorrect: false });
        } else {
            // Handle error or provide feedback to the user
            alert('minimum 2 choix et maximum 4');
        }
    }

    removeChoice(index: number) {
        if (this.answers.length > 2) {
            this.answers.splice(index, 1);
        } else {
            alert('minimum 2');
        }
    }

    addQuestion() {
        let goodAnswer = 0;
        for (const answer of this.answers) {
            if (answer.isCorrect) {
                goodAnswer++;
            }
        }

        if (goodAnswer < 1 || goodAnswer === this.answers.length) {
            alert('Au moins une bonne réponse et une mauvaise réponse');
        } else {
        }
    }
    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.answers, event.previousIndex, event.currentIndex);
    }
    addAnswer() {
        this.registerAnswer.emit(this.answers);
        this.answers.forEach((element) => {
            element.text = '';
            element.isCorrect = false;
        });
    }
}
