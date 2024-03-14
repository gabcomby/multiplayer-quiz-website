import { Component } from '@angular/core';
import { AnswersPlayer, Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-results-view',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss'],
})
export class ResultsViewComponent {
    answersQuestions: AnswersPlayer[] = [];
    questions: Question[] = [];
    playerDataSource: Player[] = [];

    constructor(private gameService: GameService) {}
    get playerList(): Player[] {
        this.playerDataSource = this.gameService.playerListValue;
        this.sortDataSource();
        return this.playerDataSource;
    }

    get allAnswersIndex(): [string, number[]][] {
        return this.gameService.allAnswersIndexValue;
    }

    get allQuestionsFromGame(): Question[] {
        return this.gameService.allQuestionsFromGameValue;
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
    }

    private sortDataSource() {
        this.playerDataSource.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }
}
