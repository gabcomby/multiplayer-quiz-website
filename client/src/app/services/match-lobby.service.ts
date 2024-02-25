import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';

const NINE_THOUSAND = 9000;
const ONE_THOUSAND = 1000;

@Injectable({
    providedIn: 'root',
})
export class MatchLobbyService {
    private apiUrl = 'http://localhost:3000/api/lobbies';
    constructor(private http: HttpClient) {}

    getAllLobbies() {
        return this.http.get(`${this.apiUrl}/`);
    }

    getLobby(lobbyId: string) {
        return this.http.get(`${this.apiUrl}/${lobbyId}`);
    }

    createLobby(creatorName: string) {
        const player: Player = {
            id: crypto.randomUUID(),
            name: creatorName,
            score: 0,
        };
        const lobby: MatchLobby = {
            id: crypto.randomUUID(),
            playerList: [player],
            bannedNames: [],
            lobbyCode: Math.floor(Math.random() * NINE_THOUSAND + ONE_THOUSAND).toString(),
            isLocked: false,
        };
        return this.http.post(`${this.apiUrl}/`, lobby);
    }

    deleteLobby(lobbyId: string) {
        return this.http.delete(`${this.apiUrl}/${lobbyId}`);
    }

    addPlayer(playerName: string, lobbyId: string) {
        const player: Player = {
            id: crypto.randomUUID(),
            name: playerName,
            score: 0,
        };
        return this.http.patch(`${this.apiUrl}/${lobbyId}/players`, player);
    }

    removePlayer(playerId: string, lobbyId: string) {
        return this.http.delete(`${this.apiUrl}/${lobbyId}/players/${playerId}`);
    }
}
