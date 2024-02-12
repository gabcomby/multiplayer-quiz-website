import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Choice } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation.service';
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

    constructor(private snackbarService: SnackbarService,
    private questionValidationService: QuestionValidationService,) {}

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

    addAnswer() {
        if (this.questionValidationService.verifyOneGoodAndBadAnswer(this.answers)) {
            if (this.questionValidationService.answerValid(this.answers)) {
                this.registerAnswer.emit(this.answers);
            }
        }
    }
}
