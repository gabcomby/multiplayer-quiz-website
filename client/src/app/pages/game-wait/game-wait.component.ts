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
    ) {
        // this.socketService.onBannedPlayer();
    }
    get banned() {
        return this.bannedFromGame;
    }
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

    bannedPlayers(): string[] {
        const bannedArray: string[] = [];
        this.matchLobbyService.getBannedArray(this.lobbyCode).subscribe((response) => {
            for (const elem of response) {
                bannedArray.push(elem);
            }
        });
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
            let player: Player = {
                id: '',
                name: '',
                score: 0,
                isLocked: false,
            };
            // this.matchLobbyService.getPlayer(name, this.lobbyCode).subscribe((response) => {
            //     next: () =>{
            //         player = response;
            //         return player;
            //     },
            //     // player = response;
            //     // return player;
            // });
            this.matchLobbyService.getPlayer(this.lobbyCode, name).subscribe({
                next: (response) => {
                    player = response;
                },
            });
            this.socketService.bannedPlayer(player.id);
            this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
            this.bannedFromGame.push(name);
            this.bannedPlayers();
            this.players = this.playerList;
        }
    }
}
