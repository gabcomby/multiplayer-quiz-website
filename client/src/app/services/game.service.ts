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
        const projection = { _id: 0 };
        const games$ = this.http.get<Game[]>(`${this.apiUrl}?projection=${JSON.stringify(projection)}`);
        const games = await firstValueFrom(games$);
        console.log(games);
        return games;
    }
    // createGame(game: Game): Observable<Game> {
    //     return this.http.post<Game>(this.apiUrl, game);
    // }

    async createGame(game: Game): Promise<Game> {
        console.log(game);
        const game$ = this.http.post<Game>(this.apiUrl, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }

    async patchGame(game: Game): Promise<Game> {
        console.log(game);
        const game$ = this.http.patch<Game>(this.apiUrl, game);
        const newGame = await firstValueFrom(game$);
        return newGame;
    }
}
