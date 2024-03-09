import { Component, OnDestroy } from '@angular/core';
import type { Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    endGame = false;
    isHost: boolean;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    private destroy = new Subject<void>();
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

    /* ngOnInit() {
        from(
            (this.unsubscribeSubject = this.gameService.initializeLobbyAndGame(
                this.route.snapshot.params['lobbyId'],
                this.route.snapshot.params['playerId'],
            )),
        )
            .pipe(
                concatMap(() => this.matchLobbyService.getLobby(this.route.snapshot.params['lobbyId'])),
                takeUntil(this.destroy),
            )
            .subscribe({
                next: (lobby) => {
                    this.isHost = this.route.snapshot.params['playerId'] === lobby.hostId;
                    this.lobby = lobby;
                },
            });
        this.gameService.finalResultsEmitter.subscribe(() => {
            this.endGame = true;
        });
    } */
    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
        this.unsubscribeSubject.forEach((subject) => {
            subject.unsubscribe();
        });
    }
    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }
}
