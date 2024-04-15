import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DURATION_SNACKBAR } from '@app/config/client-config';

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    openSnackBar(message: string, action: string = 'Fermer', duration: number = DURATION_SNACKBAR) {
        this.snackBar.open(message, action, {
            duration,
        });
    }
}
