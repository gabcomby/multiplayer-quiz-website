import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';
import { JoinGameValidationService } from '@app/services/join-game-validation.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent {
    @Input() playerList: Player[];
    lobbyCode: string;
    bannedPlayers: string[];
    constructor(
        private matchLobbyService: MatchLobbyService,
        private joinGameValidationService: JoinGameValidationService,
        private gameService: GameService,
    ) {}
    get isHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }
    makeBannedPlayer(name: string) {
        this.lobbyCode = this.joinGameValidationService.getLobby();
        console.log('the player to be banned is: ' + name);
        this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe((response: string[]) => {
            console.log('the player banned is: ', response);
            this.bannedPlayers.push(name);
            console.log(this.bannedPlayers);
            window.location.reload();
        });
    }
}
