import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { InputDialogComponent } from '@app/components/input-dialog/input-dialog.component';
import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';
import { firstValueFrom } from 'rxjs';

const MAX_GAME_NAME_LENGTH = 35;

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('downloadLink') downloadLink: ElementRef<HTMLAnchorElement>;
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'export', 'modify', 'delete'];
    dataSource: Game[] = [];
    downloadJson = '';

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private router: Router,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private gameService: GameService,
        private dialog: MatDialog,
    ) {}

    async ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.dataSource = games;
        });

        this.socketService.connect();
    }

    toggleVisibility(gameId: string, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (!game) return;

        game.isVisible = isVisible;
        this.gameService.patchGame(game).then(() => {
            this.snackbarService.openSnackBar('La visibilité a été mise à jour avec succès.');
        });
    }

    exportGameAsJson(game: Game): void {
        this.gameService.getGame(game.id).subscribe({
            next: (data) => {
                const json = JSON.stringify(this.removeUnwantedFields(data as unknown as Record<string, unknown>));
                this.downloadJson = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
                setTimeout(() => {
                    this.downloadLink.nativeElement.click();
                });
                this.snackbarService.openSnackBar('Le jeu a été exporté avec succès.');
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            },
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input?.files?.length) return;
        this.importGamesFromFile(input.files[0]);
    }

    async getValidGameTitle(originalGame: Game): Promise<string | null> {
        let gameTitle: string = originalGame.title;

        while (this.hasValidInput(gameTitle, originalGame.title)) {
            const dialogRef = this.dialog.open(InputDialogComponent, {
                width: '350px',
                data: {
                    title: 'Le nom de ce jeu existe déjà, ou est invalide. Veuillez en choisir un autre :',
                    label: 'MAX 35 caractères',
                },
            });

            const newTitle: string | null = await firstValueFrom(dialogRef.afterClosed());

            if (newTitle === null || newTitle === '') {
                return null;
            } else {
                gameTitle = newTitle;
            }
        }

        return gameTitle;
    }

    async importGamesFromFile(file: File): Promise<void> {
        if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.readAsText(file);
            const result = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => resolve((e.target as FileReader).result as string);
                reader.onerror = () => reject('Error reading file');
            });

            const game = JSON.parse(result);
            const gameTitle = await this.getValidGameTitle(game);
            if (!gameTitle) return;

            game.title = gameTitle;
            game.isVisible = false;
            this.prepareGameForImport(game);
            this.dataSource = [...this.dataSource, game];
            this.gameService.createGame(game);

            this.snackbarService.openSnackBar('Le jeu a été importé avec succès.');
        }

        return;
    }

    deleteGame(gameId: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
                title: 'Confirmer la suppression',
                message: 'Êtes-vous sûr de vouloir supprimer ce jeu?',
            },
        });

        dialogRef.afterClosed().subscribe((confirmDelete) => {
            if (!confirmDelete) return;

            this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
            this.gameService.deleteGame(gameId).then(() => {
                this.snackbarService.openSnackBar('Le jeu a été supprimé avec succès.');
            });
        });
    }

    createGame(): void {
        this.router.navigate(['/create-qgame']);
    }

    formatLastModificationDate(date: string): string {
        return new Date(date).toLocaleString('fr-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private removeUnwantedFields(data: Record<string, unknown>): unknown {
        if (Array.isArray(data)) {
            return data.map((item) => this.removeUnwantedFields(item));
        } else if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach((key) => {
                if (key === '_id' || key === '__v' || key === 'isVisible') {
                    delete data[key];
                } else {
                    data[key] = this.removeUnwantedFields(data[key] as Record<string, unknown>);
                }
            });
            return data;
        } else {
            return data;
        }
    }

    private isGameNameUnique(name: string): boolean {
        return !this.dataSource.some((game) => game.title === name);
    }

    private prepareGameForImport(game: Game): void {
        removeUnrecognizedAttributes(game);
        if (!this.gameService.isValidGame(game)) return;
        assignNewGameAttributes(game);
    }

    private hasValidInput = (input: string, title: string): boolean => {
        return !this.isGameNameUnique(input) || input === title || input.length > MAX_GAME_NAME_LENGTH || input.length === 0;
    };
}
