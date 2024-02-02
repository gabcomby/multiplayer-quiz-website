import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// TODO: ask why this is not working
//  import { environment } from '@env/environment/environment';

import type { Game, Question } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private api = 'http://localhost:3000/api';

    constructor(private http: HttpClient) {}

    getGame(gameId: string) {
        return this.http.get(`${this.api}/game/${gameId}`);
    }

    getGames() {
        return this.http.get(`${this.api}/games`);
    }

    createGame(gameData: Game) {
        return this.http.post(`${this.api}/game`, gameData);
    }

    updateGame(gameId: string, gameData: Game) {
        return this.http.put(`${this.api}/game/${gameId}`, gameData);
    }

    deleteGame(gameId: string) {
        return this.http.delete(`${this.api}/game/${gameId}`);
    }

    getQuestions(gameId: string) {
        return this.http.get(`${this.api}/game/${gameId}/questions`);
    }

    createQuestion(gameId: string, questionData: Question) {
        return this.http.post(`${this.api}/game/${gameId}/question`, questionData);
    }

    updateQuestion(gameId: string, questionId: string, questionData: Question) {
        return this.http.put(`${this.api}/game/${gameId}/question/${questionId}`, questionData);
    }

    deleteQuestion(gameId: string, questionId: string) {
        return this.http.delete(`${this.api}/game/${gameId}/question/${questionId}`);
    }
}
