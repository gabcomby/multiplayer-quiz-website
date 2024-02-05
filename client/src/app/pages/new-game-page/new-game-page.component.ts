import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { DeleteService } from '@app/services/delete.service';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    constructor(
        private gameService: GameService,
        private deleteService: DeleteService,
    ) {
        this.deleteService.delete$.subscribe((id) => {
            if (this.gameSelected[id] === true) {
                window.alert('The game that you selected has been deleted. We suggest you to select another game.');
            }
        });
    }
    ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
        });
    }
    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }
}
