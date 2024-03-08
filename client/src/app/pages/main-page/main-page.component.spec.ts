/* eslint-disable-next-line max-classes-per-file -- Those are  mock class */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { API_BASE_URL } from '@app/app.module';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
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
            imports: [RouterTestingModule.withRoutes([{ path: 'admin', component: DummyAdminComponent }]), HttpClientTestingModule],
            declarations: [MainPageComponent, DummyAdminComponent],
            providers: [
                { provide: AuthService, useClass: AuthServiceMock },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: SnackbarService, useClass: SnackbarServiceMock },
                { provide: HttpClient, useValue: {} },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
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

    it('should open ServerErrorDialogComponent for non-password related errors', () => {
        const errorResponse = new HttpErrorResponse({
            error: { body: 'Unexpected error' },
            status: 500,
        });
        spyOn(authService, 'authenticate').and.returnValue(throwError(() => errorResponse));
        const dialogSpy = spyOn(dialog, 'open').and.callThrough();

        // @ts-expect-error -- Accessing private method for testing
        component.handleDialogClose('anyPassword');

        fixture.detectChanges();
        fixture.whenStable();

        expect(dialogSpy).toHaveBeenCalledWith(ServerErrorDialogComponent, {
            data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
        });
    });

    @Component({ template: '' })
    class DummyAdminComponent {}
});
