import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import { isValidGame } from '@app/utils/is-valid-game';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

const DELAY_BEFORE_DOWNLOAD_CLICK = 100;
const MAX_GAME_NAME_LENGTH = 35;

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'modify', 'export', 'delete'];
    dataSource: Game[] = [];
    downloadJson = '';

    constructor(
        private router: Router,
        private gameService: GameService,
    ) {}

    ngOnInit() {
        this.gameService
            .getGames()
            .then((games) => {
                this.dataSource = games;
            })
            .catch((error) => {
                alert(error);
            });
    }

    toggleVisibility(gameId: string, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (!game) return;

        game.isVisible = isVisible;
        this.gameService.toggleVisibility(gameId, isVisible).catch((error) => alert(error));
    }

    exportGameAsJson(game: Game): void {
        this.gameService.getGame(game.id).subscribe({
            next: (data) => {
                this.downloadJson = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
                setTimeout(() => {
                    const link = document.querySelector(`[download='game_data_${game.id}.json']`);
                    if (link instanceof HTMLElement) link.click();
                }, DELAY_BEFORE_DOWNLOAD_CLICK);
            },
            error: (error) => {
                alert(`Error fetching game data: ${error}`);
            },
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input?.files?.length) return;
        this.importGamesFromFile(input.files[0]);
    }

    handleError(error: string): void {
        alert(error);
    }

    async getValidGameTitle(game: Game): Promise<string | null> {
        if (!this.isGameNameUnique(game.title)) {
            const newName = await new Promise<string | null>((resolve) =>
                resolve(window.prompt('Le nom de ce jeu existe déjà. Veuillez en choisir un autre :')),
            );

            if (!newName || newName === game.title || newName.length > MAX_GAME_NAME_LENGTH) {
                this.handleError('Import cancelled.');
                return null;
            }
            return newName;
        }
        return game.title;
    }

    async importGamesFromFile(file: File): Promise<void> {
        try {
            const reader = new FileReader();
            reader.readAsText(file);
            const result = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => resolve((e.target as FileReader).result as string);
                reader.onerror = () => reject('Error reading file');
            });

            const game = JSON.parse(result);
            const validTitle = await this.getValidGameTitle(game);
            if (!validTitle) return;

            game.title = validTitle;
            this.prepareGameForImport(game);
            this.dataSource = [...this.dataSource, game];
            await this.gameService.addGame(game);

            alert('Game imported successfully');
        } catch (error) {
            this.handleError('Error parsing JSON');
        }
    }

    deleteGame(gameId: string): void {
        this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
        this.gameService.deleteGame(gameId).catch((error) => alert(error));
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

    private isGameNameUnique(name: string): boolean {
        return !this.dataSource.some((game) => game.title === name);
    }

    private prepareGameForImport(game: Game): void {
        removeUnrecognizedAttributes(game);
        if (!isValidGame(game)) return;
        assignNewGameAttributes(game);
    }
}
