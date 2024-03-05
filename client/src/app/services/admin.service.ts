import { Injectable } from '@angular/core';

import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';

import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

const MAX_GAME_NAME_LENGTH = 35;

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(
        private gameService: GameService,
        private snackbarService: SnackbarService,
        private socketService: SocketService,
    ) {}

    async init(): Promise<Game[]> {
        const games = await this.fetchGames();
        this.connectSocket();
        return games;
    }
    toggleVisibility(game: Game, isVisible: boolean): void {
        if (!this.gameService.getGame(game.id)) return;

        game.isVisible = isVisible;
        this.gameService.patchGame(game).then(() => {
            this.snackbarService.openSnackBar('La visibilité a été mise à jour avec succès.');
            return;
        });
    }

    exportGameAsJson(game: Game): void {
        this.gameService.getGame(game.id).subscribe({
            next: (data) => {
                const json = JSON.stringify(this.removeUnwantedFields(data as unknown as Record<string, unknown>));
                this.snackbarService.openSnackBar('Le jeu a été exporté avec succès.');
                const fileName = `game_data_${game.id}.json`;
                const downloadJson = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
                const link = document.createElement('a');
                link.setAttribute('href', downloadJson);
                link.setAttribute('download', fileName);
                link.click();
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            },
        });
    }

    async deleteGame(gameId: string): Promise<void> {
        return this.gameService
            .deleteGame(gameId)
            .then(() => {
                this.snackbarService.openSnackBar('Le jeu a été supprimé avec succès.');
            })
            .catch(() => {
                this.snackbarService.openSnackBar('Erreur lors de la suppression du jeu.');
            });
    }

    hasValidInput = (input: string, title: string, dataSource: Game[]): boolean => {
        return !this.isGameNameUnique(input, dataSource) || input === title || input.length > MAX_GAME_NAME_LENGTH || input.length === 0;
    };

    prepareGameForImport(game: Game): void {
        removeUnrecognizedAttributes(game);
        if (!this.gameService.isValidGame(game)) return;
        assignNewGameAttributes(game);
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

    async readFileFromInput(file: File): Promise<Game | void> {
        if (!file.name.endsWith('.json')) {
            this.snackbarService.openSnackBar('Le fichier doit être un fichier JSON.');
            return Promise.resolve();
        }

        const reader = new FileReader();
        reader.readAsText(file);
        return new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(JSON.parse((e.target as FileReader).result as string));
            reader.onerror = () => reject('Error reading file');
        });
    }

    private async fetchGames(): Promise<Game[]> {
        try {
            const games = await this.gameService.getGames();
            return games;
        } catch (error) {
            this.snackbarService.openSnackBar('Erreur lors de la récupération des jeux.');
            return [];
        }
    }

    private connectSocket(): void {
        this.socketService.connect();
    }

    private isGameNameUnique(name: string, dataSource: Game[]): boolean {
        return !dataSource.some((game) => game.title === name);
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
}
