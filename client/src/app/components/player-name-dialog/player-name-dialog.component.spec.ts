import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PlayerNameDialogComponent } from './player-name-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PlayerNameDialogComponent', () => {
    let component: PlayerNameDialogComponent;
    let fixture: ComponentFixture<PlayerNameDialogComponent>;
    const dialogRefMock = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerNameDialogComponent],
            imports: [MatDialogModule, MatFormFieldModule, FormsModule, MatInputModule, BrowserAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });
    beforeEach(() => {
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
