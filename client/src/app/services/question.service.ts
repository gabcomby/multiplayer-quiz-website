import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { Observable, firstValueFrom } from 'rxjs';
// import { EventEmitter } from 'stream';
// import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [
        {
            type: '',
            text: 'Ceci est une question de test',
            points: 2,
            id: '123123',
            lastModification: new Date(),
            choices: [
                {
                    text: 'allo',
                },
                {
                    text: 'bonjour',
                },
            ],
        },
        {
            type: '',
            text: 'Ceci est une question de test 2',
            points: 3,
            id: '123123',
            lastModification: new Date(),
            choices: [
                {
                    text: 'allo 2',
                },
                {
                    text: 'bonjour 2',
                },
            ],
        },
    ];

    onQuestionAdded: EventEmitter<Question> = new EventEmitter();

    private apiUrl = 'http://localhost:3000/api/questions';

    constructor(private http: HttpClient) {}

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

    getQuestionById(questionId: string): Observable<Question> {
        return this.http.get<Question>(`${this.apiUrl}/${questionId}`);
    }

    updateList(question: Question[]) {
        this.questions = [];
        // this.questions.length = 0;
        this.questions = question.map((item) => ({ ...item }));
        // this.questions.push(...question);
    }
}
