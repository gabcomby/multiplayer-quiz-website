import { Component } from '@angular/core';
import type { Question } from '@app/interfaces/game';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    isHost: boolean;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    constructor(private gameService: GameService) {}
    // ==================== GETTERS USED AFTER REFACTOR ====================
    get currentQuestionIndexValue(): number {
        return this.gameService.currentQuestionIndexValue;
    }

    get nbrOfQuestions(): number {
        return this.gameService.nbrOfQuestionsValue;
    }

    get currentTimerCountdown(): number {
        return this.gameService.timerCountdownValue;
    }

    get totalGameDuration(): number {
        return this.gameService.totalQuestionDurationValue;
    }

    get timerStopped(): boolean {
        return this.gameService.timerStoppedValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    // ==================== GETTERS USED AFTER REFACTOR ====================

    get currentGameTitle(): string {
        return this.gameService.currentGameTitle;
    }

    get currentPlayerNameValue(): string {
        return this.gameService.currentPlayerNameValue;
    }

    get currentQuestion(): Question {
        return this.gameService.currentQuestionValue;
    }

    get questionHasExpiredValue(): boolean {
        return this.gameService.questionHasExpired;
    }

    get answerIsCorrectValue(): boolean {
        return this.gameService.answerIsCorrect;
    }

    get currentPlayerId(): string {
        return this.gameService.currentPlayerId;
    }

    get hostId(): string {
        return this.gameService.matchLobby.hostId;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.isLaunchTimerValue;
    }

    get lobbyCode() {
        return this.gameService.matchLobby.lobbyCode;
    }

    get getHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }

    get endGame(): boolean {
        return this.gameService.endGame;
    }

    setAnswerIndex(answerIdx: number[]): void {
        this.gameService.setAnswerIndex(answerIdx);
        // this.gameService.clickPlayerAnswer(answerIdx);
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
    }
}
