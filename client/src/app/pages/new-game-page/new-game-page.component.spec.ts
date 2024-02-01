import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { NewGamePageComponent } from './new-game-page.component';

describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NewGamePageComponent],
            providers: [GameService],
            imports: [HttpClientModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change the bool of the gameSelected array when function getInformations() is called', async () => {
        const gamesMock: Game[] = [
            {
                id: 'alloBonjour',
                title: 'game1',
                description: 'description1',
                isVisible: true,
                lastModification: new Date(),
                duration: 10,
                questions: [],
            },
        ];
        const gameSelectedMock = { alloBonjour: true };
        component.gameSelected = gameSelectedMock;
        component.selected(gamesMock[0]);
        expect(gameSelectedMock['alloBonjour']).toEqual(false);
    });

    it('should return the array', async () => {
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
        component.games = gamesMock;
        expect(component.games).toEqual(gamesMock);
    });
});
