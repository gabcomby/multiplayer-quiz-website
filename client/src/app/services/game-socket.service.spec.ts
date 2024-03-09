import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { API_BASE_URL } from '@app/app.module';
import { GameSocketService } from './game-socket.service';

describe('GameSocketService', () => {
    let service: GameSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameSocketService, { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' }],
            imports: [HttpClientTestingModule, MatSnackBarModule],
        });
        service = TestBed.inject(GameSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
