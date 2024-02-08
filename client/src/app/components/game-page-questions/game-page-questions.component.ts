import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Choice } from '@app/interfaces/game';
import { AnswerStateService } from '@app/services/answer-state.service';

enum AnswerStatusEnum {
    Correct,
    Wrong,
    Unanswered,
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
    answerStatusEnum = AnswerStatusEnum;
    answerStatus: AnswerStatusEnum;
    // buttonPressed: string;
    answerIsLocked: boolean;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private answerStateService: AnswerStateService,
    ) {}

    // @HostListener('keydown', ['$event'])
    // buttonDetect(event: KeyboardEvent) {
    //     if (this.verifyActiveElement()) {
    //         this.buttonPressed = event.key;
    //         if (!Number.isNaN(Number(this.buttonPressed))) {
    //             if (this.checkIfNumberValid()) {
    //                 this.toggleAnswer(Number(this.buttonPressed) - 1);
    //             }
    //         } else if (this.buttonPressed === 'Enter') {
    //             this.submitAnswer();
    //         }
    //     }
    // }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.verifyActiveElement()) {
            const buttonPressed = event.key;
            if (this.checkIsNumber(buttonPressed)) {
                if (this.checkIfNumberValid(buttonPressed)) {
                    this.toggleAnswer(Number(buttonPressed) - 1);
                }
            } else if (buttonPressed === 'Enter') {
                this.submitAnswer();
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question || changes.choices) {
            this.resetAnswerState();
        }

        if (changes.timerExpired && changes.timerExpired.currentValue === true) {
            this.calculateScoreForTheQuestion();
        }
    }

    ngOnInit(): void {
        this.selectedChoices = [];
        this.document.addEventListener('keydown', this.buttonDetect.bind(this));
    }

    ngOnDestroy(): void {
        this.document.removeEventListener('keydown', this.buttonDetect.bind(this));
    }

    toggleAnswer(index: number) {
        if (this.timerExpired || this.answerIsLocked) return;
        if (!this.checkIfMultipleChoice()) {
            this.selectedChoices = [];
        }
        const answerIdx = this.selectedChoices.indexOf(index);
        /* eslint-disable-next-line */
        if (answerIdx > -1) {
            this.selectedChoices.splice(answerIdx, 1);
        } else {
            this.selectedChoices.push(index);
        }
        this.document.body.focus();
    }

    isSelected(index: number): boolean {
        return this.selectedChoices.includes(index);
    }

    submitAnswer(): void {
        this.answerIsLocked = true;
        this.answerStateService.lockAnswer(this.answerIsLocked);
    }

    calculateScoreForTheQuestion(): void {
        let score = 0;

        if (this.checkIfMultipleChoice()) {
            if (this.checkMultipleAnswersCorrect()) {
                score = this.mark;
            } else {
                score = 0;
            }
        } else if (this.checkIfSingleAnswerCorrect()) {
            score = this.mark;
        }

        this.defineAnswerStatus(score);

        this.scoreForTheQuestion.emit(score);
    }

    private checkIfSingleAnswerCorrect(): boolean | undefined {
        return this.selectedChoices.length !== 0 && this.choices[this.selectedChoices[0]].isCorrect;
    }

    private defineAnswerStatus(score: number): void {
        if (score === this.mark) {
            this.answerStatus = this.answerStatusEnum.Correct;
        } else if (score === 0) {
            this.answerStatus = this.answerStatusEnum.Wrong;
        }
    }

    private checkIfNumberValid(buttonPressed: string): boolean {
        return Number(buttonPressed) > 0 && Number(buttonPressed) <= this.choices.length;
    }

    private verifyActiveElement(): boolean {
        return this.document.activeElement == null || this.document.activeElement.tagName.toLowerCase() !== 'textarea';
    }

    private checkMultipleAnswersCorrect(): boolean {
        let correctAnswers = 0;
        for (const answer of this.selectedChoices) {
            if (this.choices[answer].isCorrect) {
                correctAnswers++;
            } else if (!this.choices[answer].isCorrect) {
                return false;
            }
        }
        if (correctAnswers === this.numberOfCorrectAnswers()) {
            return true;
        } else {
            return false;
        }
    }

    private checkIfMultipleChoice(): boolean {
        let count = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                count++;
            }
        }
        if (count > 1) return true;
        else return false;
    }

    private numberOfCorrectAnswers(): number {
        let count = 0;
        for (const choice of this.choices) {
            if (choice.isCorrect) {
                count++;
            }
        }
        return count;
    }

    private checkIsNumber(buttonPressed: string): boolean {
        return !Number.isNaN(Number(buttonPressed));
    }

    private resetAnswerState(): void {
        this.selectedChoices = [];
        this.answerIsLocked = false;
        this.answerStateService.lockAnswer(this.answerIsLocked);
    }
}
