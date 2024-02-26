import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InputDialogComponent } from './input-dialog.component';

describe('InputDialogComponent', () => {
    let component: InputDialogComponent;
    let fixture: ComponentFixture<InputDialogComponent>;

    const dialogRefMock = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [InputDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            imports: [MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(InputDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should dismiss', () => {
        component.onCancel();
        expect(dialogRefMock.close).toHaveBeenCalled();
    });
});
