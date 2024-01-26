// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/game';
// import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    questions: Question[] = [];
    // private questions = new BehaviorSubject<Question[]>([]);
    // constructor() {}
    addQuestion(question: Question) {
        // const actualList = this.questions.getValue();
        this.questions.push(question);
        // this.questions.next([...actualList, question]);
    }
    
    getQuestion() {
        return this.questions;
        // return this.questions.asObservable();
    }
    modifiedList(question: Question[]) {
        // for (let i = 0; i < newQuestions.length; i++) {
        //     if (this.questions[i].text !== newQuestions[i].text) {
        //         this.questions[i].text = newQuestions[i].text;
        //     }
        //     if (this.questions[i].points !== newQuestions[i].points) {
        //         this.questions[i].points = newQuestions[i].points;
        //     }
        // }
        // const actualList = this.questions.getValue();
        // if (index >= 0 && index < actualList.length) {
        //     actualList[index] = question;
        //     this.questions.next([...actualList]);
        // }
        this.questions = [];
        this.questions = question;
        console.log('changement');
        console.log(this.questions);
    }
    removeQuestion($event: Question[]) {
        // const actualList = this.questions.getValue();
        // const index = actualList.indexOf(question);
        // actualList.splice(index, 1);
        // this.questions.next([...actualList]);
        this.questions = [];
        this.questions = $event;
        console.log(this.questions);
    }
}
