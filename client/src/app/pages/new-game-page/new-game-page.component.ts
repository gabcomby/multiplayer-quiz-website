import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { Game } from '@app/interfaces/game';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { Observable, lastValueFrom } from 'rxjs';
import { Socket, io } from 'socket.io-client';

const INDEX_NOT_FOUND = -1;
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
    gamesUnderscoreId: string[] = [];
    deletedGamesId: string[] = [];

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private gameService: GameService,
        private socketService: SocketService,
        private router: Router,
        private snackbarService: SnackbarService,
        private matchLobbyService: MatchLobbyService,
        private dialog: MatDialog,
    ) {}

    async ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
        });
        this.gamesUnderscoreId = this.socketService.connect();
        this.initializeSocket();
    }

    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    initializeSocket() {
        this.socket = io('http://localhost:3000');
        this.socket.on('deleteId', async (gameId: string) => {
            await this.deleteGameEvent(gameId);
        });
    }

    async deleteGameEvent(gameIdString: string) {
        this.gamesUnderscoreId.push(gameIdString);
        const index = this.gamesUnderscoreId[0].indexOf(gameIdString);
        const gameD = this.games[index];
        this.deletedGamesId.push(gameD.id);
        const goodID = gameD.id;
        if (goodID !== undefined) {
            if (this.gameSelected[goodID]) {
                this.snackbarService.openSnackBar('Game ' + goodID + ' has been deleted');
            }
        }
    }

    async isTheGameModified(game: Game): Promise<boolean> {
        let result = true;
        const newGameArray = await this.gameService.getGames();
        const indexG = newGameArray.findIndex((g) => g.id === game.id);
        if (this.deletedGamesId.indexOf(game.id) !== INDEX_NOT_FOUND) {
            const indexGame = this.games.indexOf(game);
            if (indexGame === this.games.length - 1) {
                const newSuggestedGameCase1 = this.games[0];
                this.snackbarService.openSnackBar('Game ' + game.title + ' has been deleted' + ' we suggest to play ' + newSuggestedGameCase1.title);
                result = false;
            } else if (this.games.length === 1) {
                this.snackbarService.openSnackBar('Game ' + game.title + ' has been deleted' + ' we have no other games to suggest');
                result = false;
            } else {
                const newSuggestedGame = this.games[indexGame + 1];
                this.snackbarService.openSnackBar('Game ' + game.title + ' has been deleted' + ' we suggest you to play ' + newSuggestedGame.title);
                result = false;
            }
        } else if (newGameArray[indexG].isVisible === false) {
            const indexGame = this.games.indexOf(game);
            if (indexGame === this.games.length - 1) {
                const newSuggestedGameCase1 = this.games[0];
                this.snackbarService.openSnackBar('Game ' + game.title + ' has been hidden' + ' we suggest to play ' + newSuggestedGameCase1.title);
                result = false;
            } else if (this.games.length === 1) {
                this.snackbarService.openSnackBar('Game ' + game.title + ' has been hidden' + ' we have no other games to suggest');
                result = false;
            } else {
                const newSuggestedGame = this.games[indexGame + 1];
                this.snackbarService.openSnackBar('Game ' + game.title + ' has been hidden' + ' we suggest you to play ' + newSuggestedGame.title);
                result = false;
            }
        }
        return result;
    }

    async isTheGameModifiedTest(game: Game): Promise<boolean> {
        const isModified = await this.isTheGameModified(game);
        let result;
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
            result = false;
        } else {
            this.router.navigate(['/game', game.id]);
            result = true;
        }
        return result;
    }

    async isTheGameModifiedPlay(game: Game): Promise<boolean> {
        const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
            width: '250px',
        });
        const userName = await lastValueFrom(dialogRef.afterClosed());
        if (!userName) return false;
        const isModified = await this.isTheGameModified(game);
        let result;
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
            result = false;
        } else {
            this.createNewMatchLobby(userName).subscribe({
                next: (matchLobby) => {
                    this.router.navigate(['/gameWait', game.id, matchLobby.id]);
                },
                error: (error) => {
                    this.snackbarService.openSnackBar('Error' + error + 'creating match lobby');
                },
            });
            result = true;
        }
        return result;
    }

    createNewMatchLobby(playerName: string): Observable<MatchLobby> {
        return this.matchLobbyService.createLobby(playerName);
    }
}
