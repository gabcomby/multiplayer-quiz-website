import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent implements OnInit {
    // @Input() questionList: Question[] = [];
    @Input() modifiedShown: boolean;
    oldQuestionList: Question[] = [];
    questionList: Question[] = [];

    // removeQuestion(){

    // }
    constructor(private questionService: QuestionService) {
        this.questionList = this.questionService.getQuestion();
    }
    ngOnInit() {
        for (const question of this.questionList) {
            this.oldQuestionList.push({ type: question.type, text: question.text, points: question.points, id: question.id });
        }
        return this.oldQuestionList;
    }

    modifiedQuestion() {
        this.questionService.modifiedList(this.questionList);
        this.modifiedShown = false;
    }
}
