import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-game-question-list',
    templateUrl: './game-question-list.component.html',
    styleUrls: ['./game-question-list.component.scss'],
})
export class GameQuestionListComponent implements OnInit {
    questions: Question[] = [];
    constructor(private questionService: QuestionService) {}

    ngOnInit() {
        this.questionService.getQuestion().subscribe((list) => (this.questions = list));
    }
}
