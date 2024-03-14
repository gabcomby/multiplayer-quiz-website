import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
// import { SocketService } from '@app/services/socket.service';
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

    get answersClicked() {
        return this.gameService.answersClicked;
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
        return 'Placeholder';
    }

    nextQuestion(): void {
        this.gameService.nextQuestion();
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
    }
}
