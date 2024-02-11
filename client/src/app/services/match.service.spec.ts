import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Match } from '@app/interfaces/match';
import { MatchService } from '@app/services/match.service';

describe('MatchService', () => {
    let service: MatchService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:3000/api/matches';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MatchService],
        });
        service = TestBed.inject(MatchService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should retrieve all matches', () => {
        const dummyMatches: Match[] = [
            { id: '1', playerList: [] },
            { id: '2', playerList: [] },
        ];

        service.getAllMatches().subscribe((matches) => {
            expect(matches.length).toBe(2);
            expect(matches).toEqual(dummyMatches);
        });

        const req = httpMock.expectOne(`${apiUrl}/`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyMatches);
    });

    it('should fetch a single match by id', () => {
        const dummyMatch: Match = { id: '1', playerList: [] };

        service.getMatch('1').subscribe((match) => {
            expect(match).toEqual(dummyMatch);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyMatch);
    });
});
