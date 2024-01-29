import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    private playerName: string = '';

    setPlayerName(name: string) {
        this.playerName = name;
    }

    getPlayerName(): string {
        return this.playerName;
    }
}
