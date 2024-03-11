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

    get bannedPlayers(): string[] {
        let bannedArray: string[] = [];
        this.matchLobbyService.getBannedArray(this.lobbyCode).subscribe((response) => {
            bannedArray = response;
        });
        console.log('banned array: ', bannedArray);
        return bannedArray;
    }

    isBanned(name: string): boolean {
        if (this.bannedPlayers.includes(name)) {
            return false;
        } else {
            return true;
        }
    }
    backHome() {
        this.socketService.disconnect();
        this.router.navigate(['/home']);
    }

    handleGameLaunch() {
        this.socketService.startGame();
        this.router.navigate(['/game']);
    }

    handleGameLeave() {
        this.gameService.handleGameLeave();
    }

    makeBannedPlayer(name: string) {
        console.log('the player to be banned is: ' + name);
        console.log('the lobby code is: ' + this.lobbyCode);
        this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
        console.log('the player has been banned');
        console.log(this.bannedPlayers);
    }
}
