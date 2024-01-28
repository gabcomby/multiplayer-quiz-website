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
    type: string = '0';
    answers: Choice[] = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ];
    questions: Question[] = [{ type: '', text: '', points: 0, choices: [{ text: '', isCorrect: false }], id: 0 }];
    choices: { id: number; question: string; allChoices: Choice[] }[] = [];

    addChoice() {
        if (this.answers.length >= 2 && this.answers.length < 4) {
            this.answers.push({ text: '', isCorrect: false });
        } else {
            // Handle error or provide feedback to the user
            console.error('minimum 2 choix et maximum 4');
        }
    }

    removeQuestion(index: number) {
        if (this.answers.length > 2) {
            this.answers.splice(index, 1);
        } else {
            console.error('minimum 2');
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
            console.log(this.answers);
        }
    }
    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.answers, event.previousIndex, event.currentIndex);
    }
}
