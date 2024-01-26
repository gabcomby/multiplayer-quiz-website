import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';

    constructor(
        public dialog: MatDialog,
        private playerService: PlayerService,
        private router: Router,
    ) {}

    openDialog(): void {
        const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
            width: '250px',
        });

        // In your dialog result subscription
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.playerService.setPlayerName(result);
                this.router.navigate(['/game']);
            }
        });
    }
}
