import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from './snackbar.service';

class MatSnackBarMock {
    open = jasmine.createSpy('open');
}

describe('SnackbarService', () => {
    let service: SnackbarService;
    let matSnackBarMock: MatSnackBarMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SnackbarService, { provide: MatSnackBar, useClass: MatSnackBarMock }],
        });
        service = TestBed.inject(SnackbarService);
        matSnackBarMock = TestBed.inject(MatSnackBar) as unknown as MatSnackBarMock;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open a snackbar with default parameters', () => {
        const message = 'Test message';
        const action = 'Fermer';
        const duration = 7000;

        service.openSnackBar(message);

        expect(matSnackBarMock.open).toHaveBeenCalledWith(message, action, { duration });
    });

    it('should open a snackbar with custom parameters', () => {
        const message = 'Custom message';
        const action = 'Action';
        const duration = 10000;

        service.openSnackBar(message, action, duration);

        expect(matSnackBarMock.open).toHaveBeenCalledWith(message, action, { duration });
    });
});
