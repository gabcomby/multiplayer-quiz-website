import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Choice } from '@app/interfaces/game';
import { SnackbarService } from '@app/services/snackbar.service';

const MAX_CHOICES = 4;
@Component({
    selector: 'app-choice',
    templateUrl: './choice.component.html',
    styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent implements OnInit {
    @Input() question: Choice[];
    @Output() registerAnswer: EventEmitter<Choice[]> = new EventEmitter();
    answers: Choice[] = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ];

    choices: Choice[];

    constructor(private snackbarService: SnackbarService) {}

    ngOnInit(): void {
        if (this.question) {
            this.choices = this.question;
        } else {
            this.choices = this.answers;
        }
    }

    addChoice(choices: Choice[] | undefined) {
        if (choices) {
            if (choices.length < MAX_CHOICES) {
                choices.push({ text: '', isCorrect: false });
            } else {
                this.snackbarService.openSnackBar('Maximum 4 choix');
            }
        }
    }

    removeChoice(index: number, choices: Choice[]) {
        if (choices.length > 2) {
            choices.splice(index, 1);
        } else {
            this.snackbarService.openSnackBar('Minimum 2 choix');
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

    verifyOneGoodAndBadAnswer(choices: Choice[]): boolean {
        let goodAnswer = 0;
        for (const choice of choices) {
            if (choice.isCorrect) {
                goodAnswer++;
            }
        }

        if (goodAnswer < 1 || goodAnswer === choices.length) {
            this.snackbarService.openSnackBar('Au moins une bonne réponse et une mauvaise réponse');
            return false;
        }
        return true;
    }

    addAnswer() {
        if (this.verifyOneGoodAndBadAnswer(this.choices)) {
            if (this.answerValid(this.choices)) {
                this.registerAnswer.emit(this.choices);
            }
        }
    }
    answerValid(answer: Choice[]) {
        let valid = true;
        answer.forEach((elem) => {
            if (elem.text === '') {
                valid = false;
                this.snackbarService.openSnackBar('tous les champs des choix de réponses doivent être remplis');
            }
        });
        return valid;
    }
}
