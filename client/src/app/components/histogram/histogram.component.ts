import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
    // @Input() questionData: Question;
    constructor(private gameService: GameService) {}

    get currentQuestion(): Question {
        return this.gameService.getCurrentQuestion();
    }

    setAnswerIndex(answerIdx: number[]): void {
        this.gameService.setAnswerIndex(answerIdx);
    }
}
