import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { NewGamePageComponent } from './new-game-page.component';

describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    let gameService: GameService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NewGamePageComponent],
            providers: [GameService],
            imports: [HttpClientModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GameService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', async () => {
        const gamesMock: Game[] = [
            {
                id: '1',
                title: 'game1',
                description: 'description1',
                isVisible: true,
                lastModification: new Date(),
                duration: 10,
                questions: [],
            },
        ];
        spyOn(gameService, 'getGames').and.returnValue(Promise.resolve(gamesMock));
        component.ngOnInit();
        expect(gameService.getGames).toHaveBeenCalled();
        await fixture.whenStable();
        expect(component.games).toEqual(gamesMock);
    });
});
