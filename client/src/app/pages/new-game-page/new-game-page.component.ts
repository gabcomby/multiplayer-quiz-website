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
        });
        this.gamesId = this.socketService.connect();
        await this.deleteGameEvent();
    }
    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    async deleteGameEvent() {
        this.socket = io('http://localhost:3000');
        const gameIdString = await this.socketService.deleteId(); // prend _id delete game
        this.gamesId.push(gameIdString);
        const index = this.gamesId.indexOf(gameIdString);
        const gameD = this.games[index]; // retour du jeux avec les infos
        const goodID = gameD.id;
        console.log(goodID);
        /* const tupleFound = this.gamesId.find((innerPair) => {
            console.log('     ');
            console.log(innerPair[1]);
            return innerPair[1] === gameId;
        });*/
        console.log('allo');
        if (goodID !== undefined) {
            console.log('goodID found');
            // const gameGoodId = tupleFound[0];
            if (this.gameSelected[goodID]) {
                alert('Game ' + goodID + ' has been deleted');
                // window.location.reload();
            } else {
                console.log('deleteComponent');
            }
        } else {
            console.log('tuple undefined');
        }
        /* this.socket.on('connect_error', () => {
            this.socket.connect();
        });*/
    }

    async nextStep(): Promise<string> {
        const deletedIdId = await this.socketService.deleteId();
        const deletedId = deletedIdId[deletedIdId.length - 1];
        return deletedId;
    }
}
