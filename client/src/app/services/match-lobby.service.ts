import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { generateLobbyId, generateNewId } from '@app/utils/assign-new-game-attributes';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchLobbyService {
    private apiUrl = 'http://localhost:3000/api/lobbies';
    constructor(private http: HttpClient) {}

    getAllLobbies() {
        return this.http.get(`${this.apiUrl}/`);
    }

    getLobby(lobbyId: string): Observable<MatchLobby> {
        return this.http.get<MatchLobby>(`${this.apiUrl}/${lobbyId}`);
    }

    createLobby(creatorName: string, gameId: string): Observable<MatchLobby> {
        const player: Player = {
            id: generateNewId(),
            name: creatorName,
            score: 0,
        };
        const lobby: MatchLobby = {
            id: generateNewId(),
            playerList: [player],
            gameId,
            bannedNames: [],
            lobbyCode: generateLobbyId(),
            isLocked: false,
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
