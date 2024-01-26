import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent {
    // @Input() questionList: Question[] = [];
    @Input() modifiedShown: boolean;
    // oldQuestionList: Question[] = [];
    questionList: Question[] = [];

    // removeQuestion(){

    // }
    constructor(private questionService: QuestionService) {
        // this.questionList = this.questionService.getQuestion();
        this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
    }
    // ngOnInit() {
    //     this.questionService.getQuestion().subscribe((list) => (this.questionList = list));
    // }

    modifiedQuestion() {
        // this.questionService.modifiedList(this.questionList);
        // this.modifiedShown = false;
        // const modifQuestion = window.prompt('changer');
        // if (modifQuestion) {
        //     this.questionService.modifiedList(index, modifQuestion);
        // }
        this.questionService.modifiedList(this.questionList);
        console.log('chose');
    }
    removeQuestion(question: Question) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.removeQuestion(this.questionList);
    }
}
