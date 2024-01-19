import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    standalone: true,
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
    imports: [ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatInputModule, FormsModule],
})
export class CreateQGamePageComponent {
    gameForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        time: new FormControl(),
    });
    // delay: number;

    onSubmit() {
        console.warn(this.gameForm.value);
    }
    //     updateName(newName) {
    //         this.profileForm.setValue(newName);
    //     }
}
