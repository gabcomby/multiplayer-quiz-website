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
    gamesId: [string, string][];
    constructor(
        private gameService: GameService,
        private socketService: SocketService,
    ) {}

    ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
        });
        this.gamesId = this.socketService.connect();
    }
    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    deleteGameEvent() {
        this.socket = io('http://localhost:3000');
        const gameIdArray = this.socketService.deleteId();
        const gameId = gameIdArray[gameIdArray.length - 1];
        console.log(gameId);
        const tupleFound = this.gamesId.find((innerPair) => {
            console.log('     ');
            console.log(innerPair[1]);
            return innerPair[1] === gameId;
        });
        console.log('allo');
        if (tupleFound !== undefined) {
            console.log('tupleFound');
            const gameGoodId = tupleFound[0];
            if (this.gameSelected[gameGoodId]) {
                alert('Game ' + gameGoodId + ' has been deleted');
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
