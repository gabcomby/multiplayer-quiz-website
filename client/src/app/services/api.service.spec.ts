import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { API_BASE_URL } from '@app/app.module';
import { ApiService } from './api.service';

describe('ApiService', () => {
    let service: ApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ApiService, { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ApiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
