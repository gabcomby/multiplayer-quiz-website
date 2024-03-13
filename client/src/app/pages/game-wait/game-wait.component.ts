/* eslint-disable max-params */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent {
    players: Player[] = [];
    bannedFromGame: string[] = [];
    lockStatus: boolean = false;
    constructor(
        private router: Router,
        private socketService: SocketService,
        private gameService: GameService,
        private matchLobbyService: MatchLobbyService,
    ) {}
    get currentPlayerName() {
        return this.gameService.currentPlayerName;
    }
    // ==================== FUNCTIONS USED AFTER REFACTOR ====================
    get playerList() {
        // this.players = this.gameService.matchLobby.playerList;
        // return this.players;
        return this.gameService.playerListValue;
    }

    get isHost() {
        return this.gameService.isHostValue;
    }

    get lobbyCode() {
        return this.gameService.lobbyCodeValue;
    }

    banPlayer(name: string) {
        this.gameService.banPlayer(name);
    }
    // ==================== FUNCTIONS USED AFTER REFACTOR ====================

    bannedPlayers(): string[] {
        const bannedArray: string[] = [];
        const subscription = this.matchLobbyService.getBannedArray(this.lobbyCode).subscribe((response) => {
            for (const elem of response) {
                bannedArray.push(elem);
            }
        });
        subscription.unsubscribe();
        return bannedArray;
    }

    backHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }

    handleGameLaunch() {
        this.socketService.startGame();
    }

    handleGameLeave() {
        this.gameService.leaveRoom();
    }

    makeBannedPlayer(name: string) {
        if (this.bannedFromGame.includes(name)) {
            return;
        } else {
            for (const element of this.players) {
                if (element.name === name) {
                    this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
                    this.socketService.bannedPlayer(element.id);
                }
            }
            const subscribe = this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
            subscribe.unsubscribe();
            this.bannedFromGame.push(name);
            this.players = this.playerList;
        }
    }

    makeLocked() {
        this.socketService.toggleRoomLock();
    }

    changeLockStatus() {
        this.lockStatus = !this.lockStatus;
    }
}
