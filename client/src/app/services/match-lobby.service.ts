import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { generateLobbyId, generateNewId } from '@app/utils/assign-new-game-attributes';
import { Observable } from 'rxjs';
// import { SocketService } from './socket.service';
// import { AnswerStateService } from './answer-state.service';

@Injectable({
    providedIn: 'root',
})
export class MatchLobbyService {
    // TODO: Change this to the actual server URL
    // private apiUrl = 'http://localhost:3000/api/lobbies';
    private apiUrl: string;
    constructor(
        private http: HttpClient,
        // private answerStateService: AnswerStateService,
        // private socketService: SocketService,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/lobbies`;
    }

    getAllLobbies() {
        return this.http.get(`${this.apiUrl}/`);
    }

    getLobby(lobbyId: string): Observable<MatchLobby> {
        const a = this.http.get<MatchLobby>(`${this.apiUrl}/${lobbyId}`);
        return a;
    }

    createLobby(creatorName: string, gameId: string): Observable<MatchLobby> {
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

    createTestLobby(creatorName: string, gameId: string): Observable<MatchLobby> {
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
            hostId: '0',
        };
        return this.http.post<MatchLobby>(`${this.apiUrl}/`, lobby);
    }

    deleteLobby(lobbyId: string) {
        return this.http.delete(`${this.apiUrl}/${lobbyId}`);
    }

    addPlayer(playerName: string, lobbyId: string): Observable<MatchLobby> {
        const player: Player = {
            id: generateNewId(),
            name: playerName,
            score: 0,
        };
        return this.http.patch<MatchLobby>(`${this.apiUrl}/${lobbyId}/players`, player);
    }

    getPlayers(lobbyId: string): Observable<Player[]> {
        return this.http.get<Player[]>(`${this.apiUrl}/${lobbyId}/players`);
    }

    getPlayer(lobbyId: string, playerId: string): Observable<Player> {
        return this.http.get<Player>(`${this.apiUrl}/${lobbyId}/players/${playerId}`);
    }

    updatePlayerScore(lobbyId: string, playerId: string, incr: number): Observable<MatchLobby> {
        return this.http.patch<MatchLobby>(`${this.apiUrl}/${lobbyId}/players/${playerId}`, { incr });
    }

    removePlayer(playerId: string, lobbyId: string): Observable<MatchLobby> {
        return this.http.delete<MatchLobby>(`${this.apiUrl}/${lobbyId}/players/${playerId}`);
    }

    getLobbyByCode(lobbyCode: string): Observable<MatchLobby> {
        return this.http.get<MatchLobby>(`${this.apiUrl}/joinLobby/${lobbyCode}`);
    }

    getBannedArray(lobbyId: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/${lobbyId}/banned`);
    }

    banPlayer(lobby: string, name: string): Observable<string[]> {
        return this.http.patch<string[]>(`${this.apiUrl}/${lobby}/banned`, { name });
    }
}
