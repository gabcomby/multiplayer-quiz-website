import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from './game.service';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(
        private gameService: GameService,
        private snackbarService: SnackbarService,
    ) {}

    toggleVisibility(game: Game, isVisible: boolean): void {
        if (!this.gameService.getGame(game.id)) return;

        game.isVisible = isVisible;
        this.gameService.patchGame(game).then(() => {
            this.snackbarService.openSnackBar('La visibilité a été mise à jour avec succès.');
            return;
        });
    }
}
