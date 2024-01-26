import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-game-question-list',
    templateUrl: './game-question-list.component.html',
    styleUrls: ['./game-question-list.component.scss'],
})
export class GameQuestionListComponent {
    questions: Question[] = [];
    constructor(private questionService: QuestionService) {
        // this.questionService.getQuestion().forEach((element) => {
        //     this.questions.push(element);
        // });
        this.questions = this.questionService.questions;
    }
    get questionList() {
        return this.questionService.questions;
    }

    // ngOnInit() {
    //     this.questionService.getQuestion().subscribe((list) => (this.questions = list));
    // }
}
