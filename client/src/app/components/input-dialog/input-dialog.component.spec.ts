import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDialogComponent } from './input-dialog.component';

describe('InputDialogComponent', () => {
    let component: InputDialogComponent;
    let fixture: ComponentFixture<InputDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [InputDialogComponent],
        });
        fixture = TestBed.createComponent(InputDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
