import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GameWaitComponent } from '@app/pages/game-wait/game-wait.component';
import { GameService } from '@app/services/game.service';

export const hostGuard: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    const gameService = inject(GameService);
    const gameWaitComponent = inject(GameWaitComponent);
    const router = inject(Router);
    const isABannedPlayer = gameWaitComponent.bannedFromGame.includes(gameService.currentPlayerName);
    const isLocked = gameService.matchLobby.isLocked;

    if (isABannedPlayer || isLocked) {
        router.createUrlTree(['home']);
        return false;
    }
    return true;
};
