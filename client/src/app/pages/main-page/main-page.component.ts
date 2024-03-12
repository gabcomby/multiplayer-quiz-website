import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PasswordDialogComponent } from '@app/components/password-dialog/password-dialog.component';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { AuthService } from '@app/services/auth.service';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

const FETCH_TIMEOUT = 5000;

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';

    // eslint-disable-next-line max-params
    constructor(
        private authService: AuthService,
        private router: Router,
        public dialog: MatDialog,
        private snackbarService: SnackbarService,
        private matchLobbyService: MatchLobbyService,
        private socketService: SocketService,
        private gameService: GameService,
    ) {}

    async fetchLobbyLockStatus(lobbyCode: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.socketService.verifyRoomLock(lobbyCode);
            this.socketService.onRoomLockStatus((isLocked: boolean) => {
                resolve(isLocked);
            });
            setTimeout(reject, FETCH_TIMEOUT);
        });
    }

    openAdminDialog(): void {
        const dialogRef = this.dialog.open(PasswordDialogComponent, { width: '300px' });
        dialogRef.afterClosed().subscribe(this.handleDialogClose);
    }

    async handleGameJoin(): Promise<void> {
        const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
            width: '300px',
            data: {
                isShown: true,
            },
        });
        const result = await lastValueFrom(dialogRef.afterClosed());
        this.handleDialogCloseBanned(result.userName, result.lobbyCode);

        if (this.isEmpyDialog(result)) {
            this.snackbarService.openSnackBar("Veuillez entrer un nom d'utilisateur et un code de salon");
            return;
        }
        this.socketService.connect();
        const authenticated = await this.authenticateUserIfBanned(result.userName, result.lobbyCode);
        if (result.lobbyCode) {
            this.matchLobbyService.getLobbyByCode(result.lobbyCode).subscribe({
                next: (lobby) => {
                    if (lobby && authenticated) {
                        this.matchLobbyService.addPlayer(result.userName, lobby.id).subscribe({
                            next: (lobbyUpdated) => {
                                const newPlayerId = lobbyUpdated.playerList[lobbyUpdated.playerList.length - 1].id;
                                this.socketService.joinRoom(result.lobbyCode, newPlayerId);
                                this.gameService.initializeLobbyAndGame(lobby.id, newPlayerId);
                                this.router.navigate(['/gameWait']);
                            },
                            error: (error) => {
                                this.snackbarService.openSnackBar('Erreur ' + error + "lors de l'ajout du joueur");
                            },
                        });
                    } else {
                        // this.snackbarService.openSnackBar("Cette partie n'existe pas ou vous en avez été banni");
                    }
                },
                error: (error) => {
                    this.snackbarService.openSnackBar('Erreur ' + error + 'lors de la récupération du salon');
                },
            });
        }
    }

    private isEmpyDialog(result: { userName: string; lobbyCode: string }): boolean {
        return result.userName.trim() === '' || result.lobbyCode.trim() === '';
    }

    private handleDialogClose = (password: string) => {
        if (password) {
            this.authenticateUser(password);
        }
    };

    private authenticateUser(password: string): void {
        this.authService.authenticate(password).subscribe({
            next: this.handleAuthenticationSuccess,
            error: this.handleAuthenticationError,
        });
    }

    private handleAuthenticationSuccess = (authenticate: boolean) => {
        if (authenticate) {
            this.router.navigate(['/admin']);
        }
    };

    private handleAuthenticationError = (error: HttpErrorResponse) => {
        if (error.error.body === 'Invalid password') {
            this.snackbarService.openSnackBar('Mot de passe invalide');
        } else {
            this.dialog.open(ServerErrorDialogComponent, {
                data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
            });
        }
    };

    private handleDialogCloseBanned = (name: string, lobbyCode: string) => {
        this.authenticateUserIfBanned(name, lobbyCode);
    };

    private async authenticateUserIfBanned(name: string, lobbyCode: string): Promise<boolean> {
        const result$ = await this.matchLobbyService.authenticateUser(name, lobbyCode);
        const result = await lastValueFrom(result$);

        if (!result) {
            const lockStatus = await this.fetchLobbyLockStatus(lobbyCode);

            if (lockStatus) {
                this.snackbarService.openSnackBar('La partie est verrouillée');
                return false;
            } else {
                return true;
            }
        } else {
            this.snackbarService.openSnackBar('Vous avez été banni de cette partie');
            return false;
        }
    }
}
