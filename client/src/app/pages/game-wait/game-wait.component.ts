import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent {
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

    backHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }

    handleGameLaunch() {
        this.socketService.startGame();
        // if (this.isHost) {
        //     this.router.navigate(['/host-game-page']);
        // } else {
        //     this.router.navigate(['/game']);
        // }
    }

    handleGameLeave() {
        this.gameService.handleGameLeave();
    }
}
