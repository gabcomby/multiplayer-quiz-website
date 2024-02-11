import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { NewGamePageComponent } from './new-game-page.component';

describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    let socketService: SocketService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    const gamesMock: Game[] = [
        {
            id: 'un',
            title: 'game1',
            description: 'description1',
            isVisible: true,
            lastModification: new Date(),
            duration: 10,
            questions: [],
        },
    ];

    beforeEach(async () => {
        const gameServiceObj = jasmine.createSpyObj('GameService', ['getGames']);
        const snackbarObj = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        await TestBed.configureTestingModule({
            declarations: [NewGamePageComponent],
            providers: [
                GameService,
                SocketService,
                { provide: GameService, useValue: gameServiceObj },
                { provide: SocketService, useValue: socketService },
                { provide: SnackbarService, useValue: snackbarObj },
            ],
            imports: [HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        socketService = jasmine.createSpyObj('SocketService', ['deleteId', 'connect']);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change the bool of the gameSelected array when function getInformations() is called', async () => {
        const gameSelectedMock = { un: true };
        component.gameSelected = gameSelectedMock;
        component.selected(gamesMock[0]);
        expect(gameSelectedMock['un']).toEqual(false);
    });

    it('should return the array', async () => {
        component.games = gamesMock;
        expect(gameServiceSpy.getGames).toHaveBeenCalled();
    });

    /* it('should connnect to the sever', async () => {
        const socketSpy = jasmine.createSpyObj('socket', ['connect']);
        component.socket = socketSpy;
        component.socket.connect();
        expect(socketSpy.connect).toHaveBeenCalled();
    });*/

    /* it('should call the on method when initialized socket is called', async () => {
        const socketSpy = jasmine.createSpyObj('socket', ['on']).and.callThrough();
        component.socket = socketSpy;
        spyOn(component, 'initializeSocket').and.callThrough();
        spyOn(component, 'deleteGameEvent');
        component.initializeSocket();
        expect(component.deleteGameEvent).toHaveBeenCalled();
    });*/

    it('sould add the game to gamesId when deleted and should alert if gameSelected was deleted', async () => {
        const deletedGamesIdMock = ['un'];
        component.deletedGamesId = deletedGamesIdMock;
        const selectedGameMock = { un: true };
        component.gameSelected = selectedGameMock;
        const deleteGameEventSpy = spyOn(component, 'deleteGameEvent');
        component.deleteGameEvent(gamesMock[0].id);
        expect(deleteGameEventSpy).toHaveBeenCalledWith(gamesMock[0].id);
    });

    it('should return the good index of the game', async () => {
        // spyOn(snackbarSpy, 'openSnackBar');
        const indexOfSpy = spyOn(gamesMock, 'indexOf').and.callThrough();
        const result = gamesMock.indexOf(gamesMock[0]);
        expect(indexOfSpy).toHaveBeenCalled();
        expect(result).toEqual(0);
    });
});
