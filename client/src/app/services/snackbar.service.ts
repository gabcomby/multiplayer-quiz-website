import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DURATION = 5000;

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string = 'Fermer', duration: number = DURATION) {
        this.snackBar.open(message, action, {
            duration,
        });
    }
}
