/* eslint-disable no-restricted-imports */
import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import { Socket, io } from 'socket.io-client';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
    providers: [SocketService],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket;
    gamesId: string[] = [];
    constructor(
        private gameService: GameService,
        private socketService: SocketService,
    ) {}

    async ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
            console.log(this.games);
        });
        this.gamesId = this.socketService.connect();
        console.log('allo');
        console.log(this.gamesId);
        await this.deleteGameEvent();
    }
    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    async deleteGameEvent() {
        this.socket = io('http://localhost:3000');
        const gameIdString = await this.socketService.deleteId();
        this.gamesId.push(gameIdString);
        const index = this.gamesId[0].indexOf(gameIdString);
        const gameD = this.games[index];
        console.log(gameD);
        const goodID = gameD.id;
        console.log(goodID);
        console.log('allo');
        if (goodID !== undefined) {
            console.log('goodID found');
            if (this.gameSelected[goodID]) {
                alert('Game ' + goodID + ' has been deleted');
                window.location.reload();
            } else {
                alert('Game ');
                console.log('deleteComponent');
                window.location.reload();
            }
        } else {
            console.log('tuple undefined');
        }
    }

    async nextStep(): Promise<string> {
        const deletedIdId = await this.socketService.deleteId();
        const deletedId = deletedIdId[deletedIdId.length - 1];
        return deletedId;
    }
}
