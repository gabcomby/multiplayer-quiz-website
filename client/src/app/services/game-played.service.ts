import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { GamePlayed } from '@app/interfaces/game';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GamePlayedService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/games-played`;
    }

    async getGamesPlayed(): Promise<GamePlayed[]> {
        const gamesPLayed$ = this.http.get<GamePlayed[]>(this.apiUrl);
        const gamesPLayed = await firstValueFrom(gamesPLayed$);
        // console.log('getGamesPlayed3');
        return gamesPLayed;
    }

    async addGamePLayed(gamesPLayed: GamePlayed): Promise<GamePlayed> {
        const gamesPLayed$ = this.http.post<GamePlayed>(this.apiUrl, gamesPLayed);
        const newGame = await firstValueFrom(gamesPLayed$);
        return newGame;
    }

    async deleteGamesPLayed(): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/deleteAllGamesPlayed`));
    }
}
