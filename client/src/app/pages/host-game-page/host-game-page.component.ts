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
    endGame = false;
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
        return this.gameService.totalGameDuration;
    }

    get currentQuestion(): Question {
        return this.gameService.getCurrentQuestion();
    }

    /* ngOnInit() {
        from((this.unsubscribeSubject = this.gameService.initializeLobbyAndGame(this.route.snapshot.params['lobbyId'])))
            .pipe(
                concatMap(() => this.matchLobbyService.getLobby(this.route.snapshot.params['lobbyId'])),
                takeUntil(this.destroy),
            )
            .subscribe({
                next: (lobby) => {
                    this.lobby = lobby;
                },
            });
        this.gameService.finalResultsEmitter.subscribe(() => {
            this.endGame = true;
        });
    }*/
}
