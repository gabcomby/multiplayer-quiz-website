import { Component } from '@angular/core';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    todayDate: Date = new Date();
    questions: string[] = ['Question 1', 'Question 2'];
    totalQuestions: number = this.questions.length;
    currentQuestion: number = 1;
    gameName: string = 'Game Name';
}
