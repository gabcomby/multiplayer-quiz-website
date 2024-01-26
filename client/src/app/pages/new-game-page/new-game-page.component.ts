import { Component } from '@angular/core';
import { games, Game } from '@app/pages/game';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent {
    games = [...games];
    gameSelected: { [key: string]: boolean } = {};
    getInformations(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }
}
