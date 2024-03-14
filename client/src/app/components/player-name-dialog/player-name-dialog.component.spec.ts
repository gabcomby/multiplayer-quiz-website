import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PlayerNameDialogComponent } from './player-name-dialog.component';

describe('PlayerNameDialogComponent', () => {
    let component: PlayerNameDialogComponent;
    let fixture: ComponentFixture<PlayerNameDialogComponent>;
    const dialogRefMock = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerNameDialogComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(PlayerNameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should submit answer', () => {
        component.userName = 'alex';
        component.lobbyCode = '1223';
        component.onSubmit();
        expect(dialogRefMock.close).toHaveBeenCalledWith({
            userName: 'alex',
            lobbyCode: '1223',
        });
    });
});
