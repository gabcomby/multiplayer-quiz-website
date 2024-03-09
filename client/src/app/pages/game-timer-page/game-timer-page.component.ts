import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-timer-page',
    templateUrl: './game-timer-page.component.html',
    styleUrls: ['./game-timer-page.component.scss'],
})
export class GameTimerPageComponent implements OnInit, OnDestroy {
    isHost: boolean;
    gameId: string;
    timerCountdown: number;
    gameTitle: string;
    idLobby: string;
    idPlayer: string;
    subscriptionSubject: Subscription;
    firstTimer: boolean;

    constructor(
        private socketService: SocketService,
        private router: Router,
        private route: ActivatedRoute,
        private gameService: GameService,
        private matchLobbyService: MatchLobbyService,
    ) {}
    ngOnInit() {
        this.firstTimer = true;
        this.gameId = this.route.snapshot.params['id'];
        this.idLobby = this.route.snapshot.params['idLobby'];
        this.idPlayer = this.route.snapshot.params['idPlayer'];
        this.checkIfHost();

        this.subscriptionSubject = this.gameService.getGame(this.gameId).subscribe({
            next: (data) => {
                this.gameTitle = data.title;
            },
        });
        this.setupWebSocketEvents();
        this.socketService.startTimer();
    }
    setupWebSocketEvents() {
        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
            if (this.timerCountdown === 0) {
                this.onTimerComplete();
            }
        });
        const timer = 5;
        this.socketService.setTimerDuration(timer);
    }

    onTimerComplete(): void {
        this.firstTimer = false;
        this.socketService.stopTimer();
        if (this.isHost) {
            this.router.navigate(['/host-game-page', this.route.snapshot.params['idLobby']]);
        } else {
            this.router.navigate(['/game', this.route.snapshot.params['idLobby'], this.route.snapshot.params['idPlayer']]);
        }
    }
    ngOnDestroy() {
        this.subscriptionSubject.unsubscribe();
    }

    checkIfHost() {
        this.matchLobbyService.getLobby(this.idLobby).subscribe({
            next: (data) => {
                this.isHost = this.idPlayer === `${data.hostId}`;
            },
        });
    }
}
