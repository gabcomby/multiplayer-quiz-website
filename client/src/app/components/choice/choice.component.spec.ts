import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceComponent } from './choice.component';

describe('ChoiceComponent', () => {
    let component: ChoiceComponent;
    let fixture: ComponentFixture<ChoiceComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChoiceComponent],
        });
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
