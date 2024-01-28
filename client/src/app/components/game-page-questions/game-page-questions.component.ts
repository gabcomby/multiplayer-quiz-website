import { Component, Input } from '@angular/core';
import { Choice } from '@app/interfaces/game';

@Component({
    selector: 'app-game-page-questions',
    templateUrl: './game-page-questions.component.html',
    styleUrls: ['./game-page-questions.component.scss'],
})
export class GamePageQuestionsComponent {
    @Input() question: string;
    @Input() mark: number;
    @Input() choices: Choice[] = [];
    @Input() timerExpired: boolean;

    selectedChoices: Choice[];
    answerGivenIsCorrect: boolean;

    ngOnInit(): void {
        this.selectedChoices = [];
    }

    onQuestionChange(): void {
        this.selectedChoices = [];
    }

    onSelectionChange(): void {
        this.answerGivenIsCorrect = false;

        for (const answer of this.selectedChoices) {
            if (answer.isCorrect) {
                this.answerGivenIsCorrect = true;
                break;
            }
        }
    }

    checkIfMultipleChoice(): boolean {
        let count = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                count++;
            }
        }
        if (count > 1) return true;
        else return false;
    }
}
