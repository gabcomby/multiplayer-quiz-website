import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { GameWaitComponent } from '@app/pages/game-wait/game-wait.component';
import { GameService } from '@app/services/game/game.service';
import { Observable } from 'rxjs';

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
