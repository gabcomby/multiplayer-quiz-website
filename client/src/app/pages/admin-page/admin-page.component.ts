import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import { isValidGame } from '@app/utils/is-valid-game';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

const DELAY_BEFORE_DOWNLOAD_CLICK = 100;
const MAX_GAME_NAME_LENGTH = 25;

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
        private http: HttpClient,
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

    openImportDialog(): void {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target && target.files && target.files.length) {
                this.importGamesFromFile(target.files[0]);
            }
        };
        fileInput.click();
    }

    importGamesFromFile(file: File): void {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileReader = e.target;
            if (fileReader && fileReader.result) {
                try {
                    const game = JSON.parse(fileReader.result as string);

                    if (!this.isGameNameUnique(game.title)) {
                        const newName = window.prompt('This game name already exists. Please enter a new name:');
                        if (!newName || newName === game.title || newName.length > MAX_GAME_NAME_LENGTH) {
                            alert('Import cancelled.');
                            return;
                        }
                        game.title = newName;
                    }

                    this.prepareGameForImport(game);
                    this.dataSource = [...this.dataSource, game];

                    this.http.post('http://localhost:3000/api/games', game).subscribe({
                        next: () => {
                            alert('Game imported successfully');
                        },
                        error: (error) => {
                            alert(`Error sending data to server: ${error}`);
                        },
                    });

                    alert('Game imported successfully');
                } catch (error) {
                    alert('Error parsing JSON');
                }
            }
        };
        reader.readAsText(file);
    }

    deleteGame(gameId: string): void {
        this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
        this.http.delete(`http://localhost:3000/api/games/${gameId}`).subscribe({
            next: () => {
                alert('Game deleted successfully');
            },
            error: (error) => {
                alert(`Error deleting game: ${error}`);
            },
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

    private isGameNameUnique(name: string): boolean {
        return !this.dataSource.some((game) => game.title === name);
    }

    private prepareGameForImport(game: Game): void {
        removeUnrecognizedAttributes(game);
        if (!isValidGame(game)) return;
        assignNewGameAttributes(game);
    }
}
