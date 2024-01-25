import { Component } from '@angular/core';
const QUESTION_TIMER = 5;
const TIME_BETWEEN_QUESTIONS = 4000;
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
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

    onTimerComplete(): void {
        setTimeout(() => {
            if (this.currentQuestion < this.totalQuestions) {
                this.currentQuestion++;
            }
        }, TIME_BETWEEN_QUESTIONS);
    }
}
