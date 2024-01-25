import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent implements OnInit {
    @Input() questionList: Question[] = [];
    @Input() modifiedShown: boolean;
    oldQuestionList: Question[] = [];

    // removeQuestion(){

    // }
    ngOnInit() {
        for (const question of this.questionList) {
            this.oldQuestionList.push({ type: question.type, text: question.text, points: question.points, id: question.id });
        }
        return this.oldQuestionList;
    }

    modifiedQuestion() {
        for (let i = 0; i < this.questionList.length; i++) {
            if (this.questionList[i].text !== this.oldQuestionList[i].text) {
                this.questionList[i].text = this.oldQuestionList[i].text;
            }
            if (this.questionList[i].points !== this.oldQuestionList[i].points) {
                this.questionList[i].points = this.oldQuestionList[i].points;
            }
        }
        this.modifiedShown = false;
        return this.questionList;
    }
}
