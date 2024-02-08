import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Choice } from '@app/interfaces/game';

const MAX_CHOICES = 4;
@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent {
    @Input() question: Choice[] | undefined;
    @Output() registerAnswer: EventEmitter<Choice[]> = new EventEmitter();
    answers: Choice[] = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ];

    addChoice(choices: Choice[] | undefined) {
        if (choices) {
            if (choices.length < MAX_CHOICES) {
                choices.push({ text: '', isCorrect: false });
            }
        } else {
            alert('minimum 2 choix et maximum 4');
        }
    }

    removeChoice(index: number, choices: Choice[]) {
        if (choices.length > 2) {
            choices.splice(index, 1);
        } else {
            alert('minimum 2');
        }
    }

    moveQuestionUp(index: number, choices: Choice[]): void {
        if (index > 0) {
            const temp = choices[index];
            choices[index] = choices[index - 1];
            choices[index - 1] = temp;
        }
    }

    moveQuestionDown(index: number, choices: Choice[]): void {
        if (index < choices.length - 1) {
            const temp = choices[index];
            choices[index] = choices[index + 1];
            choices[index + 1] = temp;
        }
    }

    addAnswer() {
        let goodAnswer = 0;
        for (const answer of this.answers) {
            if (answer.isCorrect) {
                goodAnswer++;
            }
        }

        if (goodAnswer < 1 || goodAnswer === this.answers.length) {
            alert('Au moins une bonne réponse et une mauvaise réponse');
        } else if (this.answerValid(this.answers)) {
            this.registerAnswer.emit(this.answers);
        }
    }
    answerValid(answer: Choice[]) {
        let valid = true;
        answer.forEach((elem) => {
            if (elem.text === '') {
                valid = false;
            }
        });
        return valid;
    }
}
