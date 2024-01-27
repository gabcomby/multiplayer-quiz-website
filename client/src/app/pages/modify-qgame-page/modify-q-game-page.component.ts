import { Component } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-modify-q-game-page',
    templateUrl: './modify-q-game-page.component.html',
    styleUrls: ['./modify-q-game-page.component.scss'],
})
export class ModifyQGamePageComponent {
    // id: string;
    // title: string;
    // description: string;
    // isVisible: boolean;
    // duration: number;
    // lastModification: Date;
    // questions: Question[];
    game: Game;

    constructor() {
        // this.questionList = this.questionService.getQuestion();
        // this.questionList = this.gameService.getQuestion().map((item) => ({ ...item }));
    }
}
