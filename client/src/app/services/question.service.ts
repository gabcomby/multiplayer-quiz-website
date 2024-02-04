// import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
// import { EventEmitter } from 'stream';
// import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];

    onQuestionAdded: EventEmitter<Question> = new EventEmitter();

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
    updateList(question: Question[]) {
        this.questions = [];
        // this.questions.length = 0;
        this.questions = question.map((item) => ({ ...item }));
        console.log(this.questions);
        // this.questions.push(...question);
    }
}
