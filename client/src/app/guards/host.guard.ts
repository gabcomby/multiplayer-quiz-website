import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { JoinGameValidationService } from '@app/services/join-game-validation.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export const hostGuard: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    const joinGameValidation = inject(JoinGameValidationService);
    const router = inject(Router);
    const isABannedPlayer = joinGameValidation.isBanned();

    if (!isABannedPlayer) {
        router.createUrlTree(['home']);
        return false;
    }
    return true;
};
