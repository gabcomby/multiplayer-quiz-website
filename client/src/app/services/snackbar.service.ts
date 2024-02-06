import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DURATION = 3000;

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string = 'Close', duration: number = DURATION) {
        this.snackBar.open(message, action, {
            duration,
        });
    }
}
