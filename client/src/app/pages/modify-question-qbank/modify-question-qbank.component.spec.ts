import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ModifyQuestionQbankComponent } from './modify-question-qbank.component';

@Component({
    selector: 'app-modified-question',
    template: '',
})
class AppModifiedQuestionComponent {
    @Input() listQuestionBank: boolean;
}

describe('ModifyQuestionQbankComponent', () => {
    let component: ModifyQuestionQbankComponent;
    let fixture: ComponentFixture<ModifyQuestionQbankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModifyQuestionQbankComponent, AppModifiedQuestionComponent],
            imports: [MatFormFieldModule, MatIconModule],
        });
        fixture = TestBed.createComponent(ModifyQuestionQbankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
