import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game.service';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    constructor(private gameService: GameService) {}
    get arrayGames(): Game[] {
        return this.games;
    }
    ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
        });
    }
    getInformations(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }
}
