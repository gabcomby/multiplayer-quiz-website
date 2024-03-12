import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { JoinGameValidationService } from '@app/services/join-game-validation.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent {
    @Input() playerList: Player[];
    @Input() playerGoneList: Player[];
    @Input() isHost: boolean;
    lobbyCode: string;
    bannedPlayers: string[];
    constructor(
        private matchLobbyService: MatchLobbyService,
        private joinGameValidationService: JoinGameValidationService,
    ) {}
    makeBannedPlayer(name: string) {
        this.lobbyCode = this.joinGameValidationService.getLobby();
        this.matchLobbyService.banPlayer(name, this.lobbyCode).subscribe();
    }
}
