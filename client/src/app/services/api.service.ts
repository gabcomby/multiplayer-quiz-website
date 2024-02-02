import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import type { Game, Question } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly apiUrl: string = environment.serverUrl;

    constructor(private http: HttpClient) {}

    authenticate(password: string) {
        return this.http.post<boolean>(`${this.apiUrl}/authenticate`, { password });
    }

    getGame(gameId: string) {
        return this.http.get<Game>(`${this.apiUrl}/game/${gameId}`).pipe(catchError(this.handleError<Game>('getGame')));
    }

    getGames() {
        return this.http.get<Game[]>(`${this.apiUrl}/games`).pipe(catchError(this.handleError<Game[]>('getGames', [])));
    }

    createGame(gameData: Game) {
        return this.http.post(`${this.apiUrl}/game`, gameData);
    }

    updateGame(gameId: string, gameData: Game) {
        return this.http.patch(`${this.apiUrl}/game/${gameId}`, gameData).pipe(catchError(this.handleError<Game>('updateGame')));
    }

    deleteGame(gameId: string) {
        return this.http.delete(`${this.apiUrl}/game/${gameId}`).pipe(catchError(this.handleError<Game>('deleteGame')));
    }

    getQuestions(gameId: string) {
        return this.http.get<Question>(`${this.apiUrl}/game/${gameId}/questions`).pipe(catchError(this.handleError<Question>('getQuestions')));
    }

    createQuestion(gameId: string, questionData: Question) {
        return this.http.post(`${this.apiUrl}/game/${gameId}/question`, questionData);
    }

    updateQuestion(gameId: string, questionId: string, questionData: Question) {
        return this.http
            .patch(`${this.apiUrl}/game/${gameId}/question/${questionId}`, questionData)
            .pipe(catchError(this.handleError<Question>('updateQuestion')));
    }

    deleteQuestion(gameId: string, questionId: string) {
        return this.http
            .delete(`${this.apiUrl}/game/${gameId}/question/${questionId}`)
            .pipe(catchError(this.handleError<Question>('deleteQuestion')));
    }

    private handleError<T>(_: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
