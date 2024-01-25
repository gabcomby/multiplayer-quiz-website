// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];
    // constructor() {}
    addQuestion(question: Question) {
        this.questions.push(question);
    }

    getQuestion() {
        return this.questions;
    }
}
