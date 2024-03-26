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
        return gamesPLayed;
    }

    async deleteGamesPLayed(): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/deleteAllGamesPlayed`));
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
}
