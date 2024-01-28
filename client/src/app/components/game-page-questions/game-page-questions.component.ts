import { Component, Input, SimpleChanges } from '@angular/core';
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question || changes.choices) {
            this.resetSelection();
        }
    }

    ngOnInit(): void {
        this.selectedChoices = [];
    }

    onSelectionChange(): void {
        this.answerGivenIsCorrect = false;
        console.log(this.selectedChoices);

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

    private resetSelection(): void {
        this.selectedChoices = [];
        this.answerGivenIsCorrect = false;
    }
}
