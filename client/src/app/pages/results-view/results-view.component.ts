import { Component, OnInit } from '@angular/core';
import { AnswersPlayer, Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';
// import { SocketService } from '@app/services/socket.service';
// import { Subscription } from 'rxjs';

@Component({
    selector: 'app-results-view',
    templateUrl: './results-view.component.html',
    styleUrls: ['./results-view.component.scss'],
})
export class ResultsViewComponent implements OnInit {
    answersQuestions: AnswersPlayer = new Map<string, number[]>();
    questions: Question[] = [];
    dataSource: Player[] = [];
    answersArray: AnswersPlayer[] = [];
    // socket: Socket;

    // private playerAnswersSubscription: Subscription;

    constructor(
        private gameService: GameService, // private socketService: SocketService,
    ) {}

    get answersPlayerArray(): [string, number[]][] {
        return Array.from(this.answersQuestions.entries());
    }

    async ngOnInit() {
        // this.socketService.onPlayerAnswer().subscribe((answer: AnswersPlayer) => {
        //     console.log(answer);
        //     this.updateAnswersQuestions(answer);
        // });
        this.gameService.getPlayerAnswers().subscribe((answer: AnswersPlayer) => {
            this.updateAnswersQuestions(answer);
        });

        this.gameService.finalResultsEmitter.subscribe((finalResults: Player[]) => {
            this.dataSource = finalResults;
            this.sortDataSource();
        });
        this.gameService.questionGame.subscribe((question: Question[]) => {
            this.questions = question;
        });
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

    private updateAnswersQuestions(answers: AnswersPlayer) {
        const keys = Array.from(answers.keys());
        for (const questionKey of keys) {
            if (questionKey) {
                const choices = answers.get(questionKey);
                if (choices) {
                    let questionAnswers = this.answersQuestions.get(questionKey);
                    if (!questionAnswers) {
                        questionAnswers = [];
                    }
                    for (const choice of choices) {
                        questionAnswers.push(choice);
                    }
                    this.answersQuestions.set(questionKey, questionAnswers);
                }
            }
        }
    }
}
