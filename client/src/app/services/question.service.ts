import { EventEmitter, Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
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
        this.questions = question.map((item) => ({ ...item }));
    }
}
