import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent {
    @Input() modifiedShown: boolean;
    questionList: Question[] = [];
    modifiedDisable: boolean = true;

    constructor(private questionService: QuestionService) {
        // this.questionList = this.questionService.getQuestion();
        this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
    }
    // ngOnInit() {
    //     this.questionService.getQuestion().subscribe((list) => (this.questionList = list));
    // }
    modifier() {
        this.modifiedDisable = false;
    }
    modifiedQuestion() {
        this.questionService.updateList(this.questionList);
        this.modifiedDisable = true;
    }
    removeQuestion(question: Question) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        // this.questionList.forEach((element, index) => {
        //     element.id = index + 1;
        // });
        this.questionService.updateList(this.questionList);
    }
}
