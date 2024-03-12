import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent {
    @Input() playerList: Player[];
    bannedList: string[] = this.gameService.matchLobby.bannedNames;
    constructor(private gameService: GameService) {}
    get banned() {
        /* this.matchLobbyService.getBannedArray(this.gameService.matchLobby.lobbyCode).subscribe((response) => {
            this.bannedList = response;
        });*/
        this.bannedList = this.gameService.matchLobby.bannedNames;
        return this.bannedList;
    }
    get isHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }
    /* isBanned(playerName: string): boolean {
        // this.gameService.refreshPlayerList();
        return this.gameService.matchLobby.bannedNames.includes(playerName);
    }*/
}
