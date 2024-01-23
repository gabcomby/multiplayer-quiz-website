import { Injectable } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    canActivate: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
        const password = prompt('Mot de passe admin:', '');

        if (password !== null) {
            return this.authService.authenticate(password).pipe(
                map((isAuthenticated: boolean) => {
                    if (isAuthenticated) {
                        return true;
                    } else {
                        alert('faux mot de passe');
                        this.router.navigate(['/']);
                        return false;
                    }
                }),
            );
        }
        return false;
    };
}
