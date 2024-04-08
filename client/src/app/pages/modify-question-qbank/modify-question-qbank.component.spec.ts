import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
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
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            declarations: [ModifyQuestionQbankComponent, AppModifiedQuestionComponent],
            imports: [MatFormFieldModule, MatIconModule, HttpClientTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: convertToParamMap({ id: null }),
                        },
                    },
                },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ModifyQuestionQbankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ModifyQuestionQbankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
