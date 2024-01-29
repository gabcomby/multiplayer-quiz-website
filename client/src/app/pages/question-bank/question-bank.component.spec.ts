import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionBankComponent } from './question-bank.component';

describe('QuestionBankComponent', () => {
    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, QuestionBankComponent],
        });

        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
        fixture.detectChanges();
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
