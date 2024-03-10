import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { JoinGameValidationService } from '@app/services/join-game-validation.service';
import { GameService } from '@app/services/game.service';

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
        this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
    }

}
