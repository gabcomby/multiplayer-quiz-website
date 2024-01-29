import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Choice } from '@app/interfaces/game';

enum AnswerStatus {
    Correct,
    Wrong,
    Unanswered,
    PartiallyCorrect,
}

@Component({
    selector: 'app-game-page-questions',
    templateUrl: './game-page-questions.component.html',
    styleUrls: ['./game-page-questions.component.scss'],
})
export class GamePageQuestionsComponent implements OnInit, OnDestroy, OnChanges {
    @Input() question: string;
    @Input() mark: number;
    @Input() choices: Choice[] = [];
    @Input() timerExpired: boolean;
    @Output() scoreForTheQuestion = new EventEmitter<number>();

    selectedChoices: number[];
    answerGivenIsCorrect: boolean;
    AnswerStatus = AnswerStatus;
    answerStatus: AnswerStatus;
    buttonPressed: string;

    constructor(@Inject(DOCUMENT) private document: Document) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if (!Number.isNaN(Number(this.buttonPressed))) {
            const stringAsNumber = Number(this.buttonPressed);
            this.toggleAnswer(stringAsNumber - 1);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question || changes.choices) {
            this.selectedChoices = [];
        }
    }

    ngOnInit(): void {
        this.selectedChoices = [];
        this.document.addEventListener('keydown', this.buttonDetect.bind(this));
    }

    ngOnDestroy(): void {
        this.document.removeEventListener('keydown', this.buttonDetect.bind(this));
    }

    // TODO: Subscribe this function to the timer expired event
    calculateScoreForTheQuestion(): void {
        if (this.checkIfMultipleChoice()) {
            const pointPerCorrectAnswer = this.mark / this.numberOfCorrectAnswers();
            let rightAnswers = 0;
            for (const index of this.selectedChoices) {
                if (this.choices[index].isCorrect) {
                    rightAnswers++;
                }
            }
            let score = pointPerCorrectAnswer * rightAnswers;
            if (this.selectedChoices.length > this.numberOfExpectedAnswers()) {
                const wrongAnswers = this.selectedChoices.length - this.numberOfExpectedAnswers();
                score -= wrongAnswers * pointPerCorrectAnswer;
            }
            if (score === this.mark) this.answerStatus = AnswerStatus.Correct;
            else if (score === 0) this.answerStatus = AnswerStatus.Wrong;
            else this.answerStatus = AnswerStatus.PartiallyCorrect;
            // this.scoreForTheQuestion.emit(score);
        } else {
            if (this.choices[this.selectedChoices[0]].isCorrect) {
                this.answerStatus = AnswerStatus.Correct;
                // this.scoreForTheQuestion.emit(this.mark);
            } else {
                this.answerStatus = AnswerStatus.Wrong;
                // this.scoreForTheQuestion.emit(0);
            }
        }
    }

    numberOfExpectedAnswers(): number {
        let count = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                count++;
            }
        }
        return count;
    }

    toggleAnswer(index: number) {
        if (this.timerExpired) return;
        const answerIdx = this.selectedChoices.indexOf(index);
        if (!this.checkIfMultipleChoice()) {
            this.selectedChoices = [];
        }
        if (answerIdx > -1) {
            this.selectedChoices.splice(answerIdx, 1);
        } else {
            this.selectedChoices.push(index);
        }
        // TODO: Remove this line once the timer expired event is implemented
        this.calculateScoreForTheQuestion();
    }

    isSelected(index: number): boolean {
        return this.selectedChoices.includes(index);
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

    numberOfCorrectAnswers(): number {
        let count = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                count++;
            }
        }
        return count;
    }

    // onSelectionChange(): void {
    //     this.answerGivenIsCorrect = false;
    //     console.log(this.selectedChoices);

    //     for (const answer of this.selectedChoices) {
    //         if (answer.isCorrect) {
    //             this.answerGivenIsCorrect = true;
    //             break;
    //         }
    //     }
    // }

    // checkIfMultipleChoice(): boolean {
    //     let count = 0;
    //     for (const choice of this.choices) {
    //         if (choice.isCorrect) {
    //             count++;
    //         }
    //     }
    //     if (count > 1) return true;
    //     else return false;
    // }
    //     <mat-chip-listbox
    //     aria-label="Question answers"
    //     class="custom-chip-listbox"
    //     [multiple]="checkIfMultipleChoice()"
    //     [(ngModel)]="selectedChoices"
    //     (change)="onSelectionChange()"
    //     name="selectedChoices"
    // >
    //     <mat-chip-option
    //         *ngFor="let choice of choices"
    //         [value]="choice"
    //         [disabled]="timerExpired"
    //         [class.correct-answer]="timerExpired && choice.isCorrect"
    //         [class.wrong-answer]="timerExpired && !choice.isCorrect"
    //     >
    //         {{ choice.text }}
    //     </mat-chip-option>
    // </mat-chip-listbox>
}
