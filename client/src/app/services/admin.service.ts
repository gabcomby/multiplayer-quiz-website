import { Injectable } from '@angular/core';

import { Game } from '@app/interfaces/game';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';

import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';
import { ApiService } from './api.service';
import { GameService } from './game.service';

const MAX_GAME_NAME_LENGTH = 35;

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    // eslint-disable-next-line max-params -- Single responsibility principlex
    constructor(
        private apiService: ApiService,
        private snackbarService: SnackbarService,
        private socketService: SocketService,
        private gameService: GameService,
    ) {}

    async init(): Promise<Game[]> {
        const games = await this.fetchGames();
        this.connectSocket();
        return games;
    }

    async toggleVisibility(game: Game, isVisible: boolean): Promise<void> {
        if (!this.apiService.getGame(game.id)) return;

        game.isVisible = isVisible;
        this.apiService.patchGame(game).then(() => {
            this.snackbarService.openSnackBar('La visibilité a été mise à jour avec succès.');
            return;
        });
    }

    exportGameAsJson(game: Game): void {
        this.apiService.getGame(game.id).subscribe({
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

    addGame(game: Game, gameTitle: string, dataSource: Game[]): Game[] {
        game.title = gameTitle;
        game.isVisible = false;
        this.prepareGameForImport(game);
        dataSource = [...dataSource, game];
        this.apiService.createGame(game);
        this.snackbarService.openSnackBar('Le jeu a été importé avec succès.');
        return dataSource;
    }

    async deleteGame(gameId: string): Promise<void> {
        return this.apiService
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
        return new Promise((resolve) => {
            reader.onload = (e) => resolve(JSON.parse((e.target as FileReader).result as string));
        });
    }

    private async fetchGames(): Promise<Game[]> {
        try {
            const games = await this.apiService.getGames();
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

    private removeUnwantedFields(data: Record<string, unknown> | unknown[]): unknown {
        if (Array.isArray(data)) {
            return data.map((item) => this.removeUnwantedFields(item as Record<string, unknown>));
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
