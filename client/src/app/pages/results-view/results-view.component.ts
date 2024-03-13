import { Component, OnInit } from '@angular/core';
import { AnswersPlayer, Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-results-view',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss'],
})
export class ResultsViewComponent implements OnInit {
    answersQuestions: AnswersPlayer[] = [];
    questions: Question[] = [];
    dataSource: Player[] = [];
    answersArray: [string, number[]][] = [];

    constructor(private gameService: GameService) {}
    get playerListValue(): Player[] {
        return this.gameService.playerListFromLobby;
    }

    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }

    async ngOnInit() {
        this.gameService.getPlayerAnswers().subscribe({
            next: (answers: AnswersPlayer[]) => {
                this.answersQuestions = answers;
                this.updateAnswersQuestions(answers);
            },
        });

        this.gameService.questionGame.subscribe({
            next: (question: Question[]) => {
                this.questions = question;
            },
        });

        this.dataSource = this.playerListValue;
        this.sortDataSource();
    }

    private sortDataSource() {
        this.dataSource.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }

    private updateAnswersQuestions(answers: AnswersPlayer[]) {
        for (const answer of answers) {
            for (const playerChoice of Object.entries(answer)) {
                if (playerChoice) {
                    this.answersArray.push([playerChoice[1].key, playerChoice[1].value]);
                }
            }
        }
    }
}
