import { Component, Input } from '@angular/core';
import type { Player } from '@app/interfaces/match';
import { GameService } from '@app/services/game.service';
import { GameWaitComponent } from '@app/pages/game-wait/game-wait.component';

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent {
    @Input() playerList: Player[];
    bannedList: string[];
    constructor(
        private gameService: GameService,
        private gameWaitComponent: GameWaitComponent,
    ) {}
    get banned() {
        this.bannedList = this.gameWaitComponent.bannedFromGame;
        return this.bannedList;
    }
    get isHost() {
        return this.gameService.matchLobby.hostId === this.gameService.currentPlayerId;
    }
}
