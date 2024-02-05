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
    @Input() modifiedShown: boolean;
    @Input() listQuestionBank: boolean;

    questionList: Question[] = [];
    disabled: boolean[] = [];

    constructor(private questionService: QuestionService) {}

    // ngOnInit(): void {
    //     if (!this.gameQuestions) {
    //         this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
    //     } else {
    //         this.questionList = this.gameQuestions;
    //     }
    //     if (this.listQuestionBank) {
    //         this.loadQuestionsFromBank();
    //     this.disabled = this.questionList.map(() => true);

    ngOnInit() {
        if (this.listQuestionBank) {
            this.loadQuestionsFromBank();
        } else {
            if (!this.gameQuestions) {
                this.questionList = this.questionService.getQuestion().map((item) => ({ ...item }));
            } else {
                this.questionList = this.gameQuestions;
            }
        }

        this.questionService.onQuestionAdded.subscribe((question) => {
            this.questionList.push(question);
            this.disabled.push(true);
        });
    }

    // addChoice() {
    //     if (this.questionList.length < 4) {
    //         this.answers.push(this.createAnswerField());
    //     } else {
    //         alert('maximum 4 choix');
    //     }

    //     this.questionList.forEach((question) => {
    //         if (question.choices?.length < 4) {
    //             if (question.choices.length !== 0) {
    //                 if (question.choices.length > 2) {
    //                     question.choices.splice(index, 1);
    //                 }
    //             }
    //         }
    //     });
    // }
    removeChoice(index: number) {
        this.questionList.forEach((question) => {
            if (question.choices) {
                if (question.choices.length !== 0) {
                    if (question.choices.length > 2) {
                        question.choices.splice(index, 1);
                    }
                }
            }
        });
    }

    async loadQuestionsFromBank() {
        this.questionList = await this.questionService.getQuestions();
        this.disabled = this.questionList.map(() => true);
    }

    toggleModify(index: number) {
        this.disabled[index] = false;
    }

    saveQuestion(index: number) {
        this.questionList[index].lastModification = new Date();
        if (this.listQuestionBank) {
            this.questionService.updateQuestion(this.questionList[index].id, this.questionList[index]);
            this.disabled[index] = true;
        } else {
            this.questionService.updateList(this.questionList);
            this.disabled[index] = true;
        }
    }

    removeQuestion(question: Question, index: number) {
        this.questionList = this.questionList.filter((element) => element.id !== question.id);
        this.questionService.updateList(this.questionList);
        this.disabled[index] = true;
    }

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questionList, event.previousIndex, event.currentIndex);
    }
}
