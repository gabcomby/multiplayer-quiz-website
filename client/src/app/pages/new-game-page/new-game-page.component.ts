import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { Game } from '@app/interfaces/game';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { ApiService } from '@app/services/api.service';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { Socket } from 'socket.io-client';

const INDEX_NOT_FOUND = -1;
@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit, OnDestroy {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket;
    gamesUnderscoreId: string[] = [];
    deletedGamesId: string[] = [];
    subscription: Subscription;

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private socketService: SocketService,
        private router: Router,
        private snackbarService: SnackbarService,
        private matchLobbyService: MatchLobbyService,
        private dialog: MatDialog,
        private apiService: ApiService,
        private gameService: GameService,
    ) {}

    async ngOnInit() {
        this.apiService.getGames().then((games) => {
            this.games = games;
        });
        this.gamesUnderscoreId = this.socketService.connect();
        this.initializeSocket();
    }

    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    initializeSocket() {
        this.socketService.deletedGame((gameId: string) => {
            this.deleteGameEvent(gameId);
        });
    }

    deleteGameEvent(gameIdString: string) {
        this.gamesUnderscoreId.push(gameIdString);
        const index = this.gamesUnderscoreId[0].indexOf(gameIdString);
        const gameD = this.games[index];
        if (gameD) {
            this.deletedGamesId.push(gameD.id);
            const goodID = gameD.id;
            if (goodID !== undefined) {
                if (this.gameSelected[goodID]) {
                    this.snackbarService.openSnackBar('Game ' + goodID + ' has been deleted');
                }
            }
        }
    }

    snackbarHiddenGame(game: Game, indexGame: number) {
        let suggestion = '';
        if (indexGame === this.games.length - 1) {
            const newSuggestedGameCase1 = this.games[0];
            suggestion = ' we suggest to play ' + newSuggestedGameCase1.title;
        } else if (this.games.length === 1) {
            suggestion = ' we have no other games to suggest';
        } else {
            const newSuggestedGame = this.games[indexGame + 1];
            suggestion = ' we suggest you to play ' + newSuggestedGame.title;
        }
        this.snackbarService.openSnackBar('Game ' + game.title + ' has been hidden' + suggestion);
    }

    snackbarDeletedGame(game: Game, indexGame: number) {
        let suggestion = '';
        if (indexGame === this.games.length - 1) {
            const newSuggestedGameCase1 = this.games[0];
            suggestion = ' we suggest to play ' + newSuggestedGameCase1.title;
        } else if (this.games.length === 1) {
            suggestion = ' we have no other games to suggest';
        } else {
            const newSuggestedGame = this.games[indexGame + 1];
            suggestion = ' we suggest you to play ' + newSuggestedGame.title;
        }
        this.snackbarService.openSnackBar('Game ' + game.title + ' has been deleted' + suggestion);
    }

    async isOriginalGame(game: Game): Promise<boolean> {
        let result = true;
        const newGameArray = await this.apiService.getGames();
        const indexG = newGameArray.findIndex((g) => g.id === game.id);
        if (this.deletedGamesId.indexOf(game.id) !== INDEX_NOT_FOUND) {
            const indexGame = this.games.indexOf(game);
            this.snackbarDeletedGame(game, indexGame);
            result = false;
        } else if (!newGameArray[indexG].isVisible) {
            const indexGame = this.games.indexOf(game);
            this.snackbarHiddenGame(game, indexGame);
            result = false;
        }
        return result;
    }

    async isTheGameModifiedTest(game: Game): Promise<boolean> {
        const isModified = await this.isOriginalGame(game);
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
            return false;
        } else {
            this.subscription = this.createNewMatchLobby(game.id).subscribe({
                next: (matchLobby) => {
                    this.router.navigate(['/game', matchLobby.id, matchLobby.playerList[0].id]);
                },
                error: (error) => {
                    this.snackbarService.openSnackBar('Error' + error + 'creating match lobby');
                },
            });
            return true;
        }
    }
    backHome() {
        this.socketService.disconnect();
    }

    async isTheGameModifiedPlay(game: Game): Promise<boolean> {
        const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
            width: '300px',
            data: {
                isShown: false,
            },
        });
        const result = await lastValueFrom(dialogRef.afterClosed());
        if (!result || this.isEmpyDialog(result)) return false;
        const isModified = await this.isOriginalGame(game);
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
            return false;
        } else {
            this.createNewMatchLobby(game.id).subscribe({
                next: (matchLobby) => {
                    this.socketService.connect();
                    this.socketService.createRoom(matchLobby.lobbyCode);
                    this.gameService.initializeLobbyAndGame(matchLobby.id, matchLobby.hostId);
                    this.router.navigate(['/gameWait']);
                },
                error: (error) => {
                    this.snackbarService.openSnackBar('Error' + error + 'creating match lobby');
                },
            });
            return true;
        }
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    createNewMatchLobby(gameId: string): Observable<MatchLobby> {
        return this.matchLobbyService.createLobby(gameId);
    }

    createNewTestLobby(playerName: string, gameId: string): Observable<MatchLobby> {
        return this.matchLobbyService.createTestLobby(playerName, gameId);
    }

    private isEmpyDialog(result: { userName: string; lobbyCode: string }): boolean {
        return result.userName.trim() === '';
    }
}
