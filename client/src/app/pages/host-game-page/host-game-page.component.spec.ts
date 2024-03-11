import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { HostGamePageComponent } from './host-game-page.component';

import { of } from 'rxjs';

class MockGameService {
    initializeHostGame = jasmine.createSpy().and.returnValue(of({}));
    finalResultsEmitter = of({});
    getCurrentQuestion = jasmine.createSpy('getCurrentQuestion').and.returnValue({});
}

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { params: { lobbyId: 'mockLobbyId' } } } },
                { provide: MatchLobbyService },
                { provide: GameService, useClass: MockGameService },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
            ],
        });
        fixture = TestBed.createComponent(HostGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
