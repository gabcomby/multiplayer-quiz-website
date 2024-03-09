import { Injectable } from '@angular/core';
import type { AnswersPlayer } from '@app/interfaces/game';
import { GameService } from './game.service';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class GameSocketService {
    constructor(
        private socketService: SocketService,
        private gameService: GameService,
    ) {}

    setupWebsocketEvents(): void {
        this.socketService.onTimerCountdown((data) => {
            this.gameService.timerCountdown = data;
            if (this.gameService.timerCountdown === 0) {
                this.gameService.onTimerComplete();
            }
        });

        this.socketService.onPlayerAnswer().subscribe((answer: AnswersPlayer) => {
            this.gameService.answersSelected.next(answer);
        });

        this.socketService.onEndGame().subscribe(() => {
            this.gameService.calculateFinalResults();
        });

        this.socketService.onStopTimer(() => {
            this.gameService.onTimerComplete();
        });

        this.socketService.onAdminDisconnect(() => {
            this.gameService.handleGameLeave();
        });

        this.socketService.onPlayerDisconnect(() => {
            this.gameService.refreshPlayerList();
        });

        this.socketService.onNewPlayerJoin(() => {
            this.gameService.refreshPlayerList();
        });
    }
}
