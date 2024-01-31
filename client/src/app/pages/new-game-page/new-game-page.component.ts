import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { io, Socket } from 'socket.io-client';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket = io('ws://localhost:3000');
    constructor(private gameService: GameService) {
        this.socket.on('delete', (gameId) => {
            if (this.gameSelected[gameId]) {
                alert('Game ' + gameId + ' has been deleted');
                this.games = this.games.filter((game) => game.id !== gameId);
                delete this.gameSelected[gameId];
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
