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
    constructor(
        private router: Router,
        private socketService: SocketService,
        private gameService: GameService,
        private matchLobbyService: MatchLobbyService,
    ) {}
    get playerList() {
        this.players = this.gameService.matchLobby.playerList;
        return this.players;
    }

    get isHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }

    get lobbyCode() {
        return this.gameService.matchLobby.lobbyCode;
    }

    get lockStatus() {
        return this.gameService.matchLobby.isLocked;
    }

    get currentPlayerName() {
        return this.gameService.currentPlayerName;
    }
    bannedPlayers(): string[] {
        const bannedArray: string[] = [];
        const subscription = this.matchLobbyService.getBannedArray(this.lobbyCode).subscribe((response) => {
            for (const elem of response) {
                bannedArray.push(elem);
            }
        });
        subscription.unsubscribe();
        this.bannedFromGame = bannedArray;
        return this.bannedFromGame;
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
}
