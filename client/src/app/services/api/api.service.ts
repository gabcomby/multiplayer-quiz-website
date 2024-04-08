import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Game } from '@app/interfaces/game';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    apiUrl: string;
    constructor(
        @Inject(API_BASE_URL) baseUrl: string,
        private http: HttpClient,
    ) {
        this.apiUrl = `${baseUrl}/games`;
    }

    getGame(gameId: string): Observable<Game> {
        return this.http.get<Game>(`${this.apiUrl}/${gameId}`);
    }

    async getGames(): Promise<Game[]> {
        const games$ = this.http.get<Game[]>(this.apiUrl);
        const games = await firstValueFrom(games$);
        return games;
    }

    async createGame(game: Game): Promise<Game> {
        const game$ = this.http.post<Game>(this.apiUrl, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }

    async deleteGame(gameId: string): Promise<void> {
        const game$ = this.http.delete(`${this.apiUrl}/${gameId}`);
        await firstValueFrom(game$);
    }

    async patchGame(game: Game): Promise<Game> {
        const game$ = this.http.patch<Game>(`${this.apiUrl}/${game.id}`, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }
}
