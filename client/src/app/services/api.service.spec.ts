import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@app/services/api.service';
import { environment } from 'src/environments/environment';

describe('ApiService', () => {
    let httpMock: HttpTestingController;
    let service: ApiService;
    let apiUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService],
        });
        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
        apiUrl = environment.serverUrl;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should authenticate and return expected result', () => {
        const password = 'testPassword';
        const expectedResult = true;

        service.authenticate(password).subscribe((result) => {
            expect(result).toEqual(expectedResult);
        });

        const req = httpMock.expectOne(`${apiUrl}/authenticate`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedResult);
    });
});
