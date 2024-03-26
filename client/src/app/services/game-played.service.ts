import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { GamePlayed } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class GamePlayedService {
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}/games-played`;
    }

    async getQuestions(): Promise<GamePlayed[]> {
        const questions$ = this.http.get<GamePlayed[]>(this.apiUrl);
        const questions = await firstValueFrom(questions$);
        return questions;
    }

    async addQuestionBank(question: GamePlayed): Promise<GamePlayed> {
        const question$ = this.http.post<GamePlayed>(this.apiUrl, question);
        const newQuestion = await firstValueFrom(question$);
        return newQuestion;
    }

    // getQuestionById(questionId: string): Observable<GamePlayed> {
    //     return this.http.get<GamePlayed>(`${this.apiUrl}/${questionId}`);
    // }

    async deleteQuestion(questionId: string): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${questionId}`));
    }
}
