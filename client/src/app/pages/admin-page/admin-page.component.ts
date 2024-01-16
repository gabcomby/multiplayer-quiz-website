import { Component } from '@angular/core';

import { Game } from '@app/interfaces/game';

const FAKE_GAMES: Game[] = [
    { id: 1, title: 'Party 1', description: 'Description of Party 1', isVisible: true, lastUpdate: new Date() },
    { id: 2, title: 'Party 2', description: 'Description of Party 2', isVisible: true, lastUpdate: new Date() },
    { id: 3, title: 'Party 3', description: 'Description of Party 3', isVisible: true, lastUpdate: new Date() },
    { id: 4, title: 'Party 4', description: 'Description of Party 4', isVisible: true, lastUpdate: new Date() },
    { id: 5, title: 'Party 5', description: 'Description of Party 5', isVisible: true, lastUpdate: new Date() },
    { id: 6, title: 'Party 6', description: 'Description of Party 6', isVisible: true, lastUpdate: new Date() },
    { id: 7, title: 'Party 7', description: 'Description of Party 7', isVisible: true, lastUpdate: new Date() },
    { id: 8, title: 'Party 8', description: 'Description of Party 8', isVisible: true, lastUpdate: new Date() },
    { id: 9, title: 'Party 9', description: 'Description of Party 9', isVisible: true, lastUpdate: new Date() },
    { id: 10, title: 'Party 10', description: 'Description of Party 10', isVisible: true, lastUpdate: new Date() },
];

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'export', 'delete'];
    dataSource = FAKE_GAMES;

    toggleVisibility(gameId: number, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (game) {
            game.isVisible = isVisible;
        }
    }

    exportGameAsJson(game: Game): void {
        const exportData = { id: game.id, title: game.title, description: game.description, lastUpdate: game.lastUpdate };

        const dataStr = JSON.stringify(exportData);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'game_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    deleteGame(gameId: number): void {
        this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
    }
}
