import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { Subscription } from 'rxjs';

const START_TIMER_DURATION = 5;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent {
    endGame = false;
    isHost: boolean;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    constructor(private gameService: GameService) {}

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
        if (this.isLaunchTimer) {
            return START_TIMER_DURATION;
        } else {
            return this.gameService.totalGameDuration;
        }
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

    get isLaunchTimer(): boolean {
        return this.gameService.isLaunchTimerValue;
    }

    setAnswerIndex(answerIdx: number[]): void {
        this.gameService.setAnswerIndex(answerIdx);
    }

    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }
}
