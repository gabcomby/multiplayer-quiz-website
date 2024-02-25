import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, Injectable, InjectionToken } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { environment } from '@env/environment.prod';
import { Observable, firstValueFrom } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];

    onQuestionAdded: EventEmitter<Question> = new EventEmitter();
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string = environment.serverUrl,
    ) {
        this.apiUrl = `${apiBaseURL}/api/questions`;
    }

    resetQuestions() {
        this.questions = [];
    }

    addQuestion(question: Question) {
        this.questions.push(question);
        this.onQuestionAdded.emit(question);
    }

    getQuestion() {
        return this.questions;
    }

    async getQuestions(): Promise<Question[]> {
        const questions$ = this.http.get<Question[]>(this.apiUrl);
        const questions = await firstValueFrom(questions$);
        return questions;
    }

    async addQuestionBank(question: Question): Promise<Question> {
        const question$ = this.http.post<Question>(this.apiUrl, question);
        const newQuestion = await firstValueFrom(question$);
        return newQuestion;
    }

    getQuestionById(questionId: string): Observable<Question> {
        return this.http.get<Question>(`${this.apiUrl}/${questionId}`);
    }

    async updateQuestion(questionId: string, questionData: Question): Promise<Question> {
        const question$ = this.http.patch<Question>(`${this.apiUrl}/${questionId}`, questionData);
        const updatedQuestion = await firstValueFrom(question$);
        return updatedQuestion;
    }
    async deleteQuestion(questionId: string): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${questionId}`));
    }

    updateList(question: Question[]) {
        this.questions = [];
        this.questions = question.map((item) => ({ ...item }));
    }
}
