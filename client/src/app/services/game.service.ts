import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import type { Game } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private apiUrl = 'http://localhost:3000/api/games';

    constructor(private http: HttpClient) {}

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

    async toggleVisibility(gameId: string, isVisible: boolean): Promise<void> {
        const game$ = this.getGame(gameId);
        const game = await firstValueFrom(game$);
        game.isVisible = isVisible;
        await firstValueFrom(this.http.patch(`${this.apiUrl}/${gameId}`, game));
    }

    async addGame(game: Game): Promise<void> {
        const game$ = this.http.post(this.apiUrl, game);
        await firstValueFrom(game$);
    }

    async deleteGame(gameId: string): Promise<void> {
        const game$ = this.http.delete(`${this.apiUrl}/${gameId}`);
        await firstValueFrom(game$);
    }
}
