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

    constructor(private questionService: QuestionService) {}

    ngOnInit(): void {
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

    toggleModify(index: number): void {
        this.disabled[index] = false;
    }
    saveQuestion(index: number): void {
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }
    removeQuestion(question: Question): void {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.updateList(this.questionList);
    }
    drop(event: CdkDragDrop<Question[]>): void {
        moveItemInArray(this.questionList, event.previousIndex, event.currentIndex);
    }
}
