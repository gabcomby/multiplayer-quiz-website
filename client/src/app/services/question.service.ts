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
    modifiedList(newQuestions: Question[]) {
        for (let i = 0; i < newQuestions.length; i++) {
            if (this.questions[i].text !== newQuestions[i].text) {
                this.questions[i].text = newQuestions[i].text;
            }
            if (this.questions[i].points !== newQuestions[i].points) {
                this.questions[i].points = newQuestions[i].points;
            }
        }
        console.log('changement');
    }
    removeQuestion(question: Question) {
        this.questions.filter((ques) => ques.id === question.id);
    }
}
