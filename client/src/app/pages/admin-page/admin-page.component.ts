import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Game } from '@app/interfaces/game';

export const MATERIAL_PREBUILT_THEMES = [
    {
        value: 'indigo-pink-theme',
        label: 'Indigo & Pink',
    },
    {
        value: 'deeppurple-amber-theme',
        label: 'Deep Purple & Amber',
    },
    {
        value: 'pink-bluegrey-theme',
        label: 'Pink & Blue-grey',
    },
    {
        value: 'purple-green-theme',
        label: 'Purple & Green',
    },
];

export const MATERIAL_DEFAULT_PREBUILT_THEME = MATERIAL_PREBUILT_THEMES[0];

const FAKE_GAMES: Game[] = [
    { id: 1, title: 'Party 1', description: 'Description of Party 1', isVisible: true },
    { id: 2, title: 'Party 2', description: 'Description of Party 2', isVisible: true },
    { id: 3, title: 'Party 3', description: 'Description of Party 3', isVisible: true },
    { id: 4, title: 'Party 4', description: 'Description of Party 4', isVisible: true },
    { id: 5, title: 'Party 5', description: 'Description of Party 5', isVisible: true },
    { id: 6, title: 'Party 6', description: 'Description of Party 6', isVisible: true },
    { id: 7, title: 'Party 7', description: 'Description of Party 7', isVisible: true },
    { id: 8, title: 'Party 8', description: 'Description of Party 8', isVisible: true },
    { id: 9, title: 'Party 9', description: 'Description of Party 9', isVisible: true },
    { id: 10, title: 'Party 10', description: 'Description of Party 10', isVisible: true },
];

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    @ViewChild('merciDialogContent')
    private readonly merciDialogContentRef: TemplateRef<HTMLElement>;

    readonly themes = MATERIAL_PREBUILT_THEMES;

    favoriteTheme: string = MATERIAL_DEFAULT_PREBUILT_THEME.value;

    displayedColumns: string[] = ['id', 'title', 'description', 'isVisible'];
    dataSource = FAKE_GAMES;

    constructor(private readonly matDialog: MatDialog) {}

    onLikeTheme(): void {
        this.matDialog.open(this.merciDialogContentRef);
    }
}
