import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { API_BASE_URL } from '@app/app.module';
import { AdminService } from './admin.service';

describe('AdminService', () => {
    let service: AdminService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AdminService, { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' }],
            imports: [HttpClientTestingModule, MatSnackBarModule],
        });
        service = TestBed.inject(AdminService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
