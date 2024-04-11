import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { ApiService } from '@app/services/api/api.service';
import { GameService } from '@app/services/game/game.service';
import { RoomService } from '@app/services/room/room.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Socket } from 'socket.io-client';

const INDEX_NOT_FOUND = -1;
const GAME_CREATION_DELAY = 750;
@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket;
    gamesVisible: Game[] = [];
    deletedGamesId: string[] = [];
    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private socketService: SocketService,
        private router: Router,
        private snackbarService: SnackbarService,
        private apiService: ApiService,
        private gameService: GameService,
        private roomService: RoomService,
    ) {}

    async ngOnInit() {
        await this.apiService.getGames().then((games) => {
            this.games = games;
        });
        this.gamesVisibleList();
    }

    selected(game: Game): void {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }
    suggestGame(game: Game): string {
        for (const gameSuggestion of this.games) {
            if (this.canItBeSuggested(gameSuggestion, game)) {
                return 'we suggest you to play' + ' ' + gameSuggestion.title;
            }
        }
        return 'there is no more games to suggest';
    }
    canItBeSuggested(newGame: Game, oldGame: Game): boolean {
        return newGame.isVisible === true && newGame.id !== oldGame.id;
    }
    suggestionChoice(game: Game): string {
        let suggestion = '';
        if (this.games.length === 1) {
            suggestion = ' we have no other games to suggest';
        } else {
            suggestion = this.suggestGame(game);
        }
        return suggestion;
    }
    snackbarHiddenGame(game: Game): void {
        const suggestion = this.suggestionChoice(game);
        this.snackbarService.openSnackBar('Game ' + game.title + ' has been hidden' + ' ' + suggestion);
    }
    snackbarDeletedGame(game: Game): void {
        const suggestion = this.suggestionChoice(game);
        this.snackbarService.openSnackBar('Game ' + game.title + ' has been deleted' + ' ' + suggestion);
    }
    async isOriginalGame(game: Game): Promise<boolean> {
        let result = true;
        const newGameArray = await this.apiService.getGames();
        const indexG = newGameArray.findIndex((item) => item.id === game.id);
        if (this.deletedGamesId.indexOf(game.id) !== INDEX_NOT_FOUND || indexG === INDEX_NOT_FOUND) {
            this.snackbarDeletedGame(game);
            result = false;
        } else if (!newGameArray[indexG].isVisible) {
            this.snackbarHiddenGame(game);
            result = false;
        }
        return result;
    }
    async launchGameTest(game: Game): Promise<void> {
        const isModified = await this.isOriginalGame(game);
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
        } else {
            this.socketService.connect();
            this.gameService.resetGameVariables();
            const player: Player = {
                id: 'test-player-id',
                name: 'Test Player',
                score: 0,
                bonus: 0,
            };
            this.socketService.createRoomTest(game.id, player);
            this.gameService.setupWebsocketEvents();
            setTimeout(() => {
                this.router.navigate(['/game']);
            }, GAME_CREATION_DELAY);
        }
    }
    backHome(): void {
        this.router.navigate(['/home']);
    }
    async launchGame(game: Game): Promise<void> {
        const isModified = await this.isOriginalGame(game);
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
        } else {
            this.socketService.connect();
            this.socketService.createRoom(game.id);
            this.gameService.resetGameVariables();
            this.gameService.setupWebsocketEvents();
            setTimeout(() => {
                this.router.navigate(['/gameWait']);
            }, GAME_CREATION_DELAY);
        }
    }

    async launchRandomGame(): Promise<void> {
        this.roomService.verifyEnoughQuestions().subscribe({
            next: (hasEnoughQuestions) => {
                if (!hasEnoughQuestions) {
                    this.snackbarService.openSnackBar('Not enough questions to start a game');
                } else {
                    this.socketService.connect();
                    this.socketService.createRoom('randomModeGame');
                    this.gameService.resetGameVariables();
                    this.gameService.setupWebsocketEvents();
                    setTimeout(() => {
                        this.router.navigate(['/gameWait']);
                    }, GAME_CREATION_DELAY);
                }
            },
        });
    }
    gamesVisibleList(): void {
        this.gamesVisible = this.games.filter((game) => game.isVisible);
        console.log(this.gamesVisible);
    }
}
