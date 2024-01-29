import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket$: WebSocketSubject<string> = webSocket('ws://localhost:3000');
    webSocket$ = this.socket$.asObservable();
    constructor(private gameService: GameService) {
        this.webSocket$.subscribe((gameId: string) => {
            if (this.gameSelected[gameId]) {
                alert('Game ' + gameId + ' has been deleted');
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
