import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { PasswordDialogComponent } from './password-dialog.component';

describe('PasswordDialogComponent', () => {
    let component: PasswordDialogComponent;
    let fixture: ComponentFixture<PasswordDialogComponent>;

    // Mock the MatDialogRef
    const dialogRefMock = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
        });

        fixture = TestBed.createComponent(PasswordDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog on calling onNoClick()', () => {
        component.onNoClick();
        expect(dialogRefMock.close).toHaveBeenCalled();
    });
});
