import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent {
    @Input() playerList: Player[];
    bannedPlayers: string[];
    lobbyCode: string;
    constructor(
        private matchLobbyService: MatchLobbyService,
        private gameService: GameService,
    ) {}
    get isHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }
    makeBannedPlayer(name: string) {
        this.lobbyCode = this.gameService.matchLobby.lobbyCode;
        console.log('the player to be banned is: ' + name);
        console.log('the lobby code is: ' + this.lobbyCode);
        this.matchLobbyService.banPlayer(name, this.lobbyCode);
    }
}
