import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameService } from './game.service';

describe('GamesService', () => {
    let service: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameService],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
