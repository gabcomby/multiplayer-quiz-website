import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent {
    isHost: boolean;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    constructor(private gameService: GameService) {}

    get lobbyCode(): string {
        return this.gameService.lobbyCodeValue;
    }

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

    get currentQuestion(): Question | null {
        return this.gameService.currentQuestionValue;
    }

    get timerStopped(): boolean {
        return this.gameService.timerStoppedValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    get playerLeftList() {
        return this.gameService.playerLeftListValue;
    }

    get answersClicked() {
        return this.gameService.answersClickedValue;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.launchTimerValue;
    }

    get currentQuestionArray(): Question[] {
        if (this.gameService.currentQuestionValue === null) {
            return [];
        } else {
            return [this.gameService.currentQuestionValue];
        }
    }

    get currentGameTitle(): string {
        return this.gameService.gameTitleValue;
    }

    nextQuestion(): void {
        this.gameService.nextQuestion();
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
    }

    handlePauseTimer(): void {
        this.gameService.pauseTimer();
    }
}
