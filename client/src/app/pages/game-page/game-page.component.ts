import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { AnswersPlayer, Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    finalScore: Player[];
    endGame = false;
    answersQuestions: AnswersPlayer;

    constructor(
        private route: ActivatedRoute,
        private gameService: GameService,
    ) {}

    get currentQuestionIndexValue(): number {
        return this.gameService.currentQuestionIndexValue;
    }

    get currentGameLength(): number {
        return this.gameService.currentGameLength;
    }

    get currentGameTitle(): string {
        return this.gameService.currentGameTitle;
    }

    get currentPlayerNameValue(): string {
        return this.gameService.currentPlayerNameValue;
    }

    get currentTimerCountdown(): number {
        return this.gameService.timerCountdownValue;
    }

    get totalGameDuration(): number {
        return this.gameService.totalGameDuration;
    }

    get currentQuestion(): Question {
        return this.gameService.getCurrentQuestion();
    }

    get questionHasExpiredValue(): boolean {
        return this.gameService.questionHasExpired;
    }

    get answerIsCorrectValue(): boolean {
        return this.gameService.answerIsCorrect;
    }

    get playerListValue(): Player[] {
        return this.gameService.playerListFromLobby;
    }

    setAnswerIndex(answerIdx: number[]): void {
        this.gameService.setAnswerIndex(answerIdx);
    }

    // REFACTOR DONE
    ngOnInit() {
        this.gameService.initializeLobbyAndGame(this.route.snapshot.params['lobbyId'], this.route.snapshot.params['playerId']);

        this.gameService.finalResultsEmitter.subscribe((finalResults: Player[]) => {
            this.endGame = true;
            this.finalScore = finalResults;
        });

        this.gameService.answersSelected.subscribe((answers: AnswersPlayer) => {
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
        });
    }

    // allAnswerlocked() {
    //     this.answerStateService.answerLocked.subscribe((locked) => {
    //         this.currentPlayer.isLocked = locked;
    //         if (locked === true) {
    //             this.answerStateService.allLocked += 1;
    //         }
    //     });
    // }
    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }
}
