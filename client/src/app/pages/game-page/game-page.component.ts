import { Component } from '@angular/core';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    todayDate: Date = new Date();
    questions: string[] = ['Quelle est la capitale des États-Unis?', 'Question 2'];
    totalQuestions: number = this.questions.length;
    currentQuestion: number = 1;
    gameName: string = 'Game Name';
    answers: string[][] = [
        ['New York', 'Pittsburgh', 'Washington', 'Las Vegas'],
        ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
    ];
}
