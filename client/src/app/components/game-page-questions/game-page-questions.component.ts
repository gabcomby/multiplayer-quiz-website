import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-page-questions',
    templateUrl: './game-page-questions.component.html',
    styleUrls: ['./game-page-questions.component.scss'],
})
export class GamePageQuestionsComponent {
    @Input() question: string;
    @Input() answers: string[];
}
