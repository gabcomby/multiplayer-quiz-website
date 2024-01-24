import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService],
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
});
