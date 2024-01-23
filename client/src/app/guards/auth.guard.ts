import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { PasswordDialogComponent } from '@app/components/password-dialog/password-dialog.component';
import { AuthService } from '@app/services/auth.service';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    constructor(
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    canActivate: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
        return this.dialog
            .open(PasswordDialogComponent, {
                width: '300px',
            })
            .afterClosed()
            .pipe(
                mergeMap((password) => {
                    if (password) {
                        return this.authService.authenticate(password).pipe(
                            mergeMap((isAuthenticated) => {
                                if (isAuthenticated) {
                                    return of(true);
                                } else {
                                    alert('faux mot de passe');
                                    return of(this.router.createUrlTree(['/']));
                                }
                            }),
                        );
                    } else {
                        return of(false);
                    }
                }),
            );
    };
}
