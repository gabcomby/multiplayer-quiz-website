import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-modified-question',
    templateUrl: './modified-question.component.html',
    styleUrls: ['./modified-question.component.scss'],
})
export class ModifiedQuestionComponent implements OnInit {
    @Input() gameQuestions: Question[];
    questionList: Question[] = [];
    disabled: boolean[] = [];

    constructor(private questionService: QuestionService) {
        // // this.questionList = this.questionService.getQuestion();
        // console.log(this.gameQuestions);
        // if (!this.gameQuestions) {
        //     this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
        // } else {
        //     this.questionList = this.gameQuestions;
        //     console.log('yes');
        // }
        // this.disabled = this.questionList.map(() => true);
        // this.questionService.onQuestionAdded.subscribe((question) => {
        //     this.questionList.push(question);
        //     this.disabled.push(true);
        // });
    }

    ngOnInit(): void {
        console.log(this.gameQuestions);
        if (!this.gameQuestions) {
            this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
        } else {
            this.questionList = this.gameQuestions;
        }
        this.disabled = this.questionList.map(() => true);
        this.questionService.onQuestionAdded.subscribe((question) => {
            this.questionList.push(question);
            this.disabled.push(true);
        });
    }

    toggleModify(index: number) {
        this.disabled[index] = false;
    }
    saveQuestion(index: number) {
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }
    removeQuestion(question: Question) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.updateList(this.questionList);
    }
    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questionList, event.previousIndex, event.currentIndex);
    }
}
