import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PasswordDialogComponent } from '@app/components/password-dialog/password-dialog.component';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { AuthService } from '@app/services/auth.service';
import { PlayerService } from '@app/services/player.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    password: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private playerService: PlayerService,
        public dialog: MatDialog,
    ) {}

    openAdminDialog(): void {
        const dialogRef = this.dialog.open(PasswordDialogComponent, { width: '300px' });

        dialogRef.afterClosed().subscribe((password) => {
            if (password) {
                this.authService.authenticate(password).subscribe((authenticate) => {
                    if (authenticate) {
                        this.router.navigate(['/admin']);
                    } else {
                        alert('Mot de passe incorrect');
                    }
                });
            }
        });
    }

    openPlayerNameDialog(): void {
        const dialogRef = this.dialog.open(PlayerNameDialogComponent, { width: '300px' });

        dialogRef.afterClosed().subscribe((playerName) => {
            if (playerName) {
                this.playerService.setPlayerName(playerName);
                this.router.navigate(['/game']);
            }
        });
    }
}
