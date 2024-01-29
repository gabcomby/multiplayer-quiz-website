import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewQuestionQbankComponent } from './new-question-qbank.component';

describe('NewQuestionQbankComponent', () => {
    let component: NewQuestionQbankComponent;
    let fixture: ComponentFixture<NewQuestionQbankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NewQuestionQbankComponent],
        });
        fixture = TestBed.createComponent(NewQuestionQbankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
