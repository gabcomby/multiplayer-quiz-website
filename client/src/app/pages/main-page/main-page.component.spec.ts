/* eslint-disable-next-line max-classes-per-file -- Those are  mock class */
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { of, throwError } from 'rxjs';

class MatDialogMock {
    open() {
        return {
            afterClosed: () => of('MockPassword'),
        };
    }
}

class AuthServiceMock {
    authenticate(password: string) {
        return of(password === 'validPassword');
    }
}

class SnackbarServiceMock {
    openSnackBar(message: string) {
        return message;
    }
}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let router: Router;
    let fixture: ComponentFixture<MainPageComponent>;
    let authService: AuthService;
    let snackbarService: SnackbarService;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'admin', component: DummyAdminComponent }])],
            declarations: [MainPageComponent, DummyAdminComponent],
            providers: [
                { provide: AuthService, useClass: AuthServiceMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: SnackbarService, useClass: SnackbarServiceMock },
            ],
        }).compileComponents();

        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthService);
        snackbarService = TestBed.inject(SnackbarService);
        dialog = TestBed.inject(MatDialog);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });

    it('should open admin dialog', () => {
        spyOn(dialog, 'open').and.callThrough();
        component.openAdminDialog();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('should authenticate user with valid password', async () => {
        spyOn(authService, 'authenticate').and.returnValue(of(true));
        const navigateSpy = spyOn(router, 'navigate');
        // @ts-expect-error -- handleDialogClose is private
        await component.handleDialogClose('validPassword');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
    });

    // Test handling dialog close with invalid password
    it('should handle authentication error', () => {
        const errorResponse = new HttpErrorResponse({
            error: { body: 'Invalid password' },
            status: 401,
        });
        spyOn(authService, 'authenticate').and.returnValue(throwError(() => errorResponse));
        spyOn(snackbarService, 'openSnackBar');
        // @ts-expect-error -- handleDialogClose is private
        component.handleDialogClose('invalidPassword');
        expect(snackbarService.openSnackBar).toHaveBeenCalledWith('Mot de passe invalide');
        // Add checks for ServerErrorDialogComponent as needed
    });

    @Component({ template: '' })
    class DummyAdminComponent {}
});
