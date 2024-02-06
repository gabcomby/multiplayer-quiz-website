import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { Game } from '@app/interfaces/game';
import { ApiService } from '@app/services/api.service';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import { isValidGame } from '@app/utils/is-valid-game';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

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

    constructor(
        private router: Router,
        private apiService: ApiService,
        private gameService: GameService,
        private socketService: SocketService,
    ) {}

    ngOnInit() {
        this.apiService.getGames().subscribe({
            next: (data) => {
                this.dataSource = data;
            },
            error: (error) => {
                alert(`Error fetching games: ${error}`);
            },
        });

        this.socketService.connect();
        this.socketService.onMessage();
    }

    sendMessage(): void {
        this.socketService.sendMessage('Hello from client');
    }

    toggleVisibility(gameId: string, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (!game) return;

        game.isVisible = isVisible;
        this.apiService.toggleVisibility(gameId, isVisible).subscribe({
            next: () => {
                alert('Visibility updated successfully');
            },
            error: (error) => {
                alert(`Error updating visibility: ${error}`);
            },
        });
    }

    exportGameAsJson(game: Game): void {
        this.gameService.getGame(game.id).subscribe({
            next: (data) => {
                const json = JSON.stringify(data);
                this.downloadJson = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
                setTimeout(() => {
                    this.downloadLink.nativeElement.click();
                });
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
            this.apiService.createGame(game);

            alert('Game imported successfully');
        } catch (error) {
            this.handleError('Error parsing JSON');
        }
    }

    deleteGame(gameId: string): void {
        const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer ce jeu?');
        if (!confirmDelete) return;

        this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
        this.apiService.deleteGame(gameId).subscribe({
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
        if (!isValidGame(game, this.gameService, true)) return;
        assignNewGameAttributes(game);
    }
}
