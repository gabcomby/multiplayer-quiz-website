import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyQuestionQbankComponent } from './modify-question-qbank.component';

describe('ModifyQuestionQbankComponent', () => {
    let component: ModifyQuestionQbankComponent;
    let fixture: ComponentFixture<ModifyQuestionQbankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ModifyQuestionQbankComponent],
        });
        fixture = TestBed.createComponent(ModifyQuestionQbankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
