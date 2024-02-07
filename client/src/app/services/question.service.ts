import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];

    onQuestionAdded: EventEmitter<Question> = new EventEmitter();
    private apiUrl = 'http://localhost:3000/api/questions';

    constructor(private http: HttpClient) {}

    resetQuestions() {
        // Julie
        this.questions = [];
    }

    addQuestion(question: Question) {
        // julie
        this.questions.push(question);
        this.onQuestionAdded.emit(question);
    }

    getQuestion() {
        // julie
        return this.questions;
    }
    // a tester
    async getQuestions(): Promise<Question[]> {
        // Julie
        const questions$ = this.http.get<Question[]>(this.apiUrl);
        const questions = await firstValueFrom(questions$);
        return questions;
    }
    // a tester
    async addQuestionBank(question: Question): Promise<Question> {
        const question$ = this.http.post<Question>(this.apiUrl, question);
        const newQuestion = await firstValueFrom(question$);
        return newQuestion;
    }

    // a tester
    getQuestionById(questionId: string): Observable<Question> {
        return this.http.get<Question>(`${this.apiUrl}/${questionId}`);
    }

    // a tester
    async updateQuestion(questionId: string, questionData: Question): Promise<Question> {
        const question$ = this.http.patch<Question>(`${this.apiUrl}/${questionId}`, questionData);
        const updatedQuestion = await firstValueFrom(question$);
        return updatedQuestion;
    }
    // a tester
    async deleteQuestion(questionId: string): Promise<void> {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${questionId}`));
        this.questions = this.questions.filter((question) => question.id !== questionId);
    }

    updateList(question: Question[]) {
        this.questions = [];
        this.questions = question.map((item) => ({ ...item }));
    }
}
