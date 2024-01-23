import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// import { ChoiceComponent } from '@app/components/choice/choice.component';

@Component({
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
})
export class CreateQGamePageComponent {
    gameForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        time: new FormControl('', Validators.required),
    });
    // delay: number;
    get name() {
        return this.gameForm.get('name');
    }

    get time() {
        return this.gameForm.get('time');
    }

    onSubmit() {
        // const formData = this.gameForm.value;
    }
}
