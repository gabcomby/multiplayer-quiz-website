/* eslint-disable max-params */
import { Component } from '@angular/core';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent {
    constructor(
        private socketService: SocketService,
        private gameService: GameService,
    ) {}
    get currentPlayerName() {
        return this.gameService.currentPlayerName;
    }
    // ==================== FUNCTIONS USED AFTER REFACTOR ====================
    get playerList() {
        return this.gameService.playerListValue;
    }

    get isHost() {
        return this.gameService.isHostValue;
    }

    get lobbyCode() {
        return this.gameService.lobbyCodeValue;
    }

    get roomIsLocked() {
        return this.gameService.roomIsLockedValue;
    }

    banPlayer(name: string) {
        this.gameService.banPlayer(name);
    }

    handleGameLeave() {
        this.gameService.leaveRoom();
    }

    toggleRoomLock() {
        this.socketService.toggleRoomLock();
    }

    handleGameLaunch() {
        this.gameService.startGame();
    }
    // ==================== FUNCTIONS USED AFTER REFACTOR ====================
}
