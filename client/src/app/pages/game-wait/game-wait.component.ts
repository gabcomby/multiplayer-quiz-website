import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent implements OnInit {
    constructor(
        private router: Router,
        private socketService: SocketService,
        private gameService: GameService,
    ) {}

    get playerList() {
        return this.gameService.matchLobby.playerList;
    }

    get isHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }

    get lobbyCode() {
        return this.gameService.matchLobby.lobbyCode;
    }

    ngOnInit() {
        this.socketService.onTimerGame(() => {
            this.router.navigate([
                '/gameTimer',
                this.gameService.matchLobby.gameId,
                this.gameService.matchLobby.id,
                this.gameService.currentPlayerId,
            ]);
        });
    }

    backHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }

    handleGameLaunch() {
        this.socketService.startGame();
    }

    handleGameLeave() {
        this.gameService.handleGameLeave();
    }
}
