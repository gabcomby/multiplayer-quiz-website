import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export const AUTH_GUARD: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    const router = inject(Router);

    const password = prompt('Mot de passe admin:', '');
    if (password === 'log2990-102') {
        return true;
    } else {
        // remove alert
        alert('faux mot de passe');
        router.navigate(['/']);
        return false;
    }
};
