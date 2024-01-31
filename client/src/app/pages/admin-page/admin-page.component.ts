import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { DeleteService } from '@app/services/delete.service';
import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import isValidGame from '@app/utils/is-valid-game';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'modify', 'export', 'delete'];
    dataSource: Game[] = [];

    constructor(
        private http: HttpClient,
        private router: Router,
        private deleteService: DeleteService,
    ) {}

    ngOnInit() {
        this.loadGames();
    }

    loadGames(): void {
        this.http.get<Game[]>('http://localhost:3000/api/games').subscribe({
            next: (data) => {
                this.dataSource = data;
            },
            error: (error) => {
                alert(error);
            },
        });
    }

    toggleVisibility(gameId: string, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (game) {
            game.isVisible = isVisible;
            this.http.patch(`http://localhost:3000/api/games/${gameId}`, game).subscribe({
                next: () => {
                    alert('Game updated successfully');
                },
                error: (error) => {
                    alert(`Error updating game: ${error}`);
                },
            });
        }
    }

    exportGameAsJson(game: Game): void {
        this.http.get(`http://localhost:3000/api/games/${game.id}`).subscribe({
            next: (data) => {
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
                linkElement.setAttribute('download', 'game_data_' + game.id + '.json');
                linkElement.click();
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
                        if (newName) {
                            game.title = newName;
                        } else {
                            alert('Import cancelled. A unique name is required.');
                            return;
                        }
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
                this.deleteService.notifyDelete(gameId);
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
