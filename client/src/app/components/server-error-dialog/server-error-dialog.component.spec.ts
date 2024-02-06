import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ServerErrorDialogComponent } from './server-error-dialog.component';

describe('ServerErrorDialogComponent', () => {
    let component: ServerErrorDialogComponent;
    let fixture: ComponentFixture<ServerErrorDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServerErrorDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { message: 'An error occurred' } },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServerErrorDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the correct message', () => {
        expect(component.data.message).toBe('An error occurred');
    });
});
