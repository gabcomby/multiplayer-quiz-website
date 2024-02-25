import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import type { Match, Player } from '@app/interfaces/match';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root',
})
export class MatchService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string = environment.serverUrl,
    ) {
        this.apiUrl = `${apiBaseURL}/api/matches`;
    }

    getAllMatches(): Observable<Match[]> {
        return this.http.get<Match[]>(`${this.apiUrl}/`);
    }

    getMatch(matchId: string): Observable<Match> {
        return this.http.get<Match>(`${this.apiUrl}/${matchId}`);
    }

    getPlayersFromMatch(matchId: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.apiUrl}/${matchId}/players`);
    }

    createNewMatch(match: Match): Observable<Match> {
        return this.http.post<Match>(`${this.apiUrl}/`, match);
    }

    deleteMatch(matchId: string): Observable<Match> {
        return this.http.delete<Match>(`${this.apiUrl}/${matchId}`);
    }

    addPlayer(player: Player, matchId: string): Observable<Match> {
        return this.http.patch<Match>(`${this.apiUrl}/${matchId}/players`, player);
    }

    removePlayer(playerId: string, matchId: string): Observable<Match> {
        return this.http.delete<Match>(`${this.apiUrl}/${matchId}/players/${playerId}`);
    }

    updatePlayerScore(matchId: string, playerId: string, score: number): Observable<Player> {
        return this.http.patch<Player>(`${this.apiUrl}/${matchId}/players/${playerId}`, { score });
    }
}
