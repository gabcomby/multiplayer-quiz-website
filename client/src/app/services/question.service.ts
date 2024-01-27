// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
// import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];

    addQuestion(question: Question) {
        this.questions.push(question);
    }

    getQuestion() {
        return this.questions;
    }
    updateList(question: Question[]) {
        this.questions = [];
        // this.questions.length = 0;
        this.questions = question.map((item) => ({ ...item }));
        // this.questions.push(...question);
    }
    // updateList(updatedQuestions: Question[]) {
    //     // Mettez à jour les objets existants dans la liste
    //     updatedQuestions.forEach((updatedQuestion) => {
    //         const existingQuestion = this.questions.find((q) => q.id === updatedQuestion.id);
    //         if (existingQuestion) {
    //             Object.assign(existingQuestion, updatedQuestion);
    //         }
    //     });
    // }
}
