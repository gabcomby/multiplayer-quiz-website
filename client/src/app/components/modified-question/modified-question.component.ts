import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
    disabled: boolean[] = [];

    constructor(private questionService: QuestionService) {
        // this.questionList = this.questionService.getQuestion();
        this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
        this.disabled = this.questionService.getQuestion().map((_) => true);
        this.questionService.onQuestionAdded.subscribe((question) => {
            this.questionList.push(question);
            this.disabled.push(true);
        });
    }
    // ngOnInit() {
    //     this.questionService.getQuestion().subscribe((list) => (this.questionList = list));
    // }
    toggleModify(index: number) {
        this.disabled[index] = false;
    }
    saveQuestion(index: number) {
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }
    removeQuestion(question: Question) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        // this.questionList.forEach((element, index) => {
        //     element.id = index + 1;
        // });
        this.questionService.updateList(this.questionList);
    }
    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questionList, event.previousIndex, event.currentIndex);
    }
}
