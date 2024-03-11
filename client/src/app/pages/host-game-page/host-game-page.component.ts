import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';

const START_TIMER_DURATION = 5;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent {
    isHost: boolean;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    constructor(
        private gameService: GameService,
        private socketService: SocketService,
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

    get playerListValue(): Player[] {
        return this.gameService.playerListFromLobby;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.isLaunchTimerValue;
    }

    get currentPlayerNameValue(): string {
        return this.gameService.currentPlayerNameValue;
    }

    get endGame(): boolean {
        return this.gameService.endGame;
    }

    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }
    goToResult(): void {
        this.socketService.goToResult();
    }
    nextQuestion() : void {
        this.socketService.nextQuestion();
    }
}
