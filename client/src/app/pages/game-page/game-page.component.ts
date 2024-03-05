import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
// import { AnswerStateService } from '@app/services/answer-state.service';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private gameService: GameService, // private answerStateService: AnswerStateService,
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
        // this.answerStateService.answerLocked.subscribe({
        //     next: ()=>{
        //         this.
        //     }
        // })
    }

    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }
}
