import { Component, OnInit } from '@angular/core';
import { TimerService } from '@app/services/timer.service';

const QUESTION_TIMER = 5;
const TIME_BETWEEN_QUESTIONS = 4000;
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    questions: string[] = ['Quelle est la capitale des États-Unis?', 'Question 2'];
    totalQuestions: number = this.questions.length;
    currentQuestion: number = 1;
    gameName: string = 'Game Name';
    answers: string[][] = [
        ['New York', 'Pittsburgh', 'Washington', 'Las Vegas'],
        ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
    ];
    gameScore: { name: string; score: number }[] = [
        { name: 'Gabriel', score: 1000 },
        { name: 'Julie', score: 300 },
        { name: 'Maxime', score: 0 },
        { name: 'Alexane', score: 550 },
    ];
    questionTimer = QUESTION_TIMER;
    questionHasExpired: boolean = false;

    constructor(private timerService: TimerService) {}

    ngOnInit() {
        this.startQuestionTimer();
    }
    startQuestionTimer() {
        this.timerService.startTimer(this.questionTimer).subscribe({
            complete: () => {
                this.onTimerComplete();
            },
        });
    }

    onTimerComplete(): void {
        this.questionHasExpired = true;
        setTimeout(() => {
            if (this.currentQuestion < this.totalQuestions) {
                this.currentQuestion++;
                this.questionHasExpired = false;
                this.startQuestionTimer(); // Restart the timer for the next question
            }
        }, TIME_BETWEEN_QUESTIONS);
    }
}
