import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Choice } from '@app/interfaces/game';
@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    @Input() questionString: string;
    @Output() buttonClick: EventEmitter<void> = new EventEmitter<void>();
    id: number = 0;
    answers: Choice[] = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ];
    choices: { id: number; question: string; allChoices: Choice[] }[] = [];

    addQuestion() {
        this.choices.push({ id: this.id, question: this.questionString, allChoices: this.answers });
        this.id++;
        console.log(this.choices);
    }
}
