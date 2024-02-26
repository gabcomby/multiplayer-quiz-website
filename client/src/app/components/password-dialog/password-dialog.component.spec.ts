import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordDialogComponent } from './password-dialog.component';

describe('PasswordDialogComponent', () => {
    let component: PasswordDialogComponent;
    let fixture: ComponentFixture<PasswordDialogComponent>;

    const dialogRefMock = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
            imports: [MatDialogModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA],
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
