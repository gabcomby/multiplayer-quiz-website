import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
// import { AppModule } from '@app/app.module';
// import { NewQuestionComponent } from '@app/pages/new-question/new-question.component'; // '/new-question/new-question.component';

@Component({
    // standalone: true,
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
    // imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatInputModule, FormsModule],
})
export class CreateQGamePageComponent implements OnInit {
    // questions: string[] = [];
    questions: Question[] = [];
    questionId: number = 0;
    addQuestionShown: boolean = true;
    modifiedQuestion: boolean = false;
    gameForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        time: new FormControl('', Validators.required),
    });

    constructor(private questionService: QuestionService) {}

    ngOnInit() {
        this.questionService.getQuestion().subscribe((list) => (this.questions = list));
    }

    // get name() {
    //     return this.gameForm.get('name');
    // }
    onSubmit() {
        // Call la fonction du service QuestionHandler pour ajouter
        // la liste locale a la liste totale des questionnaires
        alert(this.gameForm.value);
    }
    toggleAddQuestion() {
        this.addQuestionShown = !this.addQuestionShown;
    }
    toggleModifiedQuestion() {
        this.modifiedQuestion = !this.modifiedQuestion;
    }

    addQuestion(question: Question) {
        // Ajouter des qustions a la liste locale de question
        this.questionId += 1;
        question.id = this.questionId;
        // if (question.text) {
        //     this.questions.push(question);
        // }
        this.questionService.addQuestion(question);
        this.gameForm.reset();
    }

    // removeQuestion(question: Question) {
    //     this.questions.filter((ques) => ques.id === question.id);
    // }
}
