import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Question } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private apiUrl = 'http://localhost:3000/api/questions';

    constructor(private http: HttpClient) {}

    getQuestion(gameId: string): Observable<Question> {
        return this.http.get<Question>(`${this.apiUrl}/${gameId}`);
    }
}
