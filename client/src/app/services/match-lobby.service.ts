import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { generateLobbyId, generateNewId } from '@app/utils/assign-new-game-attributes';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchLobbyService {
    // TODO: Change this to the actual server URL
    // private apiUrl = 'http://localhost:3000/api/lobbies';
    private apiUrl: string;
    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/api/lobbies`;
    }

    getAllLobbies() {
        return this.http.get(`${this.apiUrl}/`);
    }

    getLobby(lobbyId: string): Observable<MatchLobby> {
        return this.http.get<MatchLobby>(`${this.apiUrl}/${lobbyId}`);
    }

    createLobby(creatorName: string, gameId: string): Observable<MatchLobby> {
        // const player: Player = {
        //     id: generateNewId(),
        //     name: creatorName,
        //     score: 0,
        // };
        const lobby: MatchLobby = {
            id: generateNewId(),
            playerList: [],
            gameId,
            bannedNames: [],
            lobbyCode: generateLobbyId(),
            isLocked: false,
            hostId: generateNewId(),
        };
        return this.http.post<MatchLobby>(`${this.apiUrl}/`, lobby);
    }

    deleteLobby(lobbyId: string) {
        return this.http.delete(`${this.apiUrl}/${lobbyId}`);
    }

    addPlayer(playerName: string, lobbyId: string) {
        const player: Player = {
            id: generateNewId(),
            name: playerName,
            score: 0,
            isLocked: false,
        };
        return this.http.patch(`${this.apiUrl}/${lobbyId}/players`, player);
    }

    removePlayer(playerId: string, lobbyId: string) {
        return this.http.delete(`${this.apiUrl}/${lobbyId}/players/${playerId}`);
    }

    getLobbyByCode(lobbyCode: string): Observable<MatchLobby> {
        return this.http.get<MatchLobby>(`${this.apiUrl}/joinLobby/${lobbyCode}`);
    }
}
