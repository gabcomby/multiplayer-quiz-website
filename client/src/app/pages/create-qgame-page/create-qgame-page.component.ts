import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';
// import { IDGenerator } from '../utils/IDGenerator';
// import { AppModule } from '@app/app.module';
// import { NewQuestionComponent } from '@app/pages/new-question/new-question.component'; // '/new-question/new-question.component';

@Component({
    // standalone: true,
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
    // imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatInputModule, FormsModule],
})
export class CreateQGamePageComponent {
    questions: Question[] = [];
    questionId: number = 0;
    modifiedQuestion: boolean = false;
    addQuestionShown: boolean = false;
    gameForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        time: new FormControl('', Validators.required),
    });

    constructor(private questionService: QuestionService) {
        // this.questionService.getQuestion().forEach((element) => {
        //     this.questions.push(element);
        // });
        this.questions = this.questionService.getQuestion();
    }

    // ngOnInit() {
    //     this.questionService.getQuestion().subscribe((list) => (this.questions = list));
    // }

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
        this.questionService.addQuestion(question);
    }
}
