import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService, { provide: API_BASE_URL, useValue: 'http://localhost:3000' }],
        });
        service = TestBed.inject(AuthService);
        httpController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected result when authenticated', () => {
        const testPassword = 'password123';
        const testResponse = true;

        service.authenticate(testPassword).subscribe((response) => {
            expect(response).toEqual(testResponse);
        });

        const req = httpController.expectOne('http://localhost:3000/api/authenticate');
        expect(req.request.method).toEqual('POST');
        req.flush(testResponse);
    });

    it('isAuthenticated$ should initially emit false', (done) => {
        service.isAuthenticated$.subscribe((isAuthenticated) => {
            expect(isAuthenticated).toBeFalse();
            done();
        });
    });

    it('checkAuthentication should return false initially', () => {
        expect(service.checkAuthentication()).toBeFalse();
    });

    it('checkAuthentication should return true after authentication is set to true', () => {
        service['isAuthenticated'].next(true);

        expect(service.checkAuthentication()).toBeTrue();
    });

    it('checkAuthentication should return false after authentication is set to false', () => {
        service['isAuthenticated'].next(false);

        expect(service.checkAuthentication()).toBeFalse();
    });
});
