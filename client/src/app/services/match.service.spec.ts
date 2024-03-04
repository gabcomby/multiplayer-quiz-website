import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/app.module';
import type { Match, Player } from '@app/interfaces/match';
import { MatchService } from '@app/services/match.service';

describe('MatchService', () => {
    let service: MatchService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:3000/api/matches';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MatchService, { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' }],
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

    it('should post a new match', () => {
        const newMatch: Match = { id: '3', playerList: [] };

        service.createNewMatch(newMatch).subscribe((match) => {
            expect(match).toEqual(newMatch);
        });

        const req = httpMock.expectOne(`${apiUrl}/`);
        expect(req.request.method).toBe('POST');
        req.flush(newMatch);
    });

    it('should delete a match and return the deleted match', () => {
        const matchId = '1';
        const deletedMatch: Match = { id: matchId, playerList: [] };

        service.deleteMatch(matchId).subscribe((response) => {
            expect(response).toEqual(deletedMatch);
        });

        const req = httpMock.expectOne(`${apiUrl}/${matchId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(deletedMatch);
    });

    it('should add a player to a match', () => {
        const matchId = '1';
        const newPlayer: Player = { id: '123', name: 'Test Player', score: 0 };
        const updatedMatch: Match = { id: matchId, playerList: [newPlayer] };

        service.addPlayer(newPlayer, matchId).subscribe((match) => {
            expect(match.playerList).toContain(newPlayer);
        });

        const req = httpMock.expectOne(`${apiUrl}/${matchId}/players`);
        expect(req.request.method).toBe('PATCH');
        req.flush(updatedMatch);
    });

    it('should fetch all players from a match', () => {
        const matchId = '1';
        const dummyPlayers: Player[] = [
            { id: 'p1', name: 'Player One', score: 10 },
            { id: 'p2', name: 'Player Two', score: 20 },
        ];

        service.getPlayersFromMatch(matchId).subscribe((players) => {
            expect(players.length).toBe(2);
            expect(players).toEqual(dummyPlayers);
        });

        const req = httpMock.expectOne(`${apiUrl}/${matchId}/players`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyPlayers);
    });

    it('should remove a player from a match and return the updated match', () => {
        const matchId = '1';
        const playerId = 'p1';
        const updatedMatch: Match = { id: matchId, playerList: [] };

        service.removePlayer(playerId, matchId).subscribe((match) => {
            expect(match).toEqual(updatedMatch);
        });

        const req = httpMock.expectOne(`${apiUrl}/${matchId}/players/${playerId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(updatedMatch);
    });

    it("should update a player's score within a match", () => {
        const matchId = '1';
        const playerId = 'p1';
        const score = 50;
        const updatedPlayer: Player = { id: playerId, name: 'Player One', score };

        service.updatePlayerScore(matchId, playerId, score).subscribe((player) => {
            expect(player).toEqual(updatedPlayer);
            expect(player.score).toBe(score);
        });

        const req = httpMock.expectOne(`${apiUrl}/${matchId}/players/${playerId}`);
        expect(req.request.method).toBe('PATCH');
        req.flush(updatedPlayer);
    });
});
