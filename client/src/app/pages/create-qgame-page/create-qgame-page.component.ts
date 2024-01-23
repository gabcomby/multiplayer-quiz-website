import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Question } from '@app/interfaces/question';
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
    questions: string[] = [];
    newQuestion: Question[];
    questionId: number = 0;
    addQuestionShown: boolean = true;
    gameForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        time: new FormControl(),
        // question: new FormControl(''),
    });

    // this.gameForm = new FormGroup({
    //     newQuestion : new FormGroup({
    //         question: new FormControl()
    //     })
    // });
    // delay: number;
    get name() {
        return this.gameForm.get('name');
    }
    onSubmit() {
        // Call la fonction du service QuestionHandler pour ajouter
        // la liste locale a la liste totale des questionnaires
        alert(this.gameForm.value);
    }
    toggleAddQuestion() {
        this.addQuestionShown = !this.addQuestionShown;
    }

    addQuestion(question: string) {
        // Ajouter des qustions a la liste locale de question

        if (question) {
            this.questions.push(question);
        }
        this.gameForm.reset();
        // alert(this.gameForm.value);
    }
    //     updateName(newName) {
    //         this.profileForm.setValue(newName);
    //     }
}
