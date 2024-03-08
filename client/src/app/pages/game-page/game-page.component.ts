import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    endGame = false;
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

        this.gameService.finalResultsEmitter.subscribe(() => {
            this.endGame = true;
        });
    }

    // ngOnDestroy(): void {
    //     this.gameService.finalResultsEmitter.unsubscribe();
    // }
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
