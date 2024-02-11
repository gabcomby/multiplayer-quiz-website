import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import { NewGamePageComponent } from './new-game-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from '@app/services/snackbar.service';
describe('NewGamePageComponent', () => {
    let component: NewGamePageComponent;
    let fixture: ComponentFixture<NewGamePageComponent>;
    let snackbarSpy: jasmine.SpyObj<SnackbarService>;

    beforeEach(async () => {
        const snackbarObj = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        await TestBed.configureTestingModule({
            declarations: [NewGamePageComponent],
            providers: [GameService, SocketService, SnackbarService, { provide: MatSnackBar, useValue: snackbarObj }],
            imports: [HttpClientModule],
        }).compileComponents();
        fixture = TestBed.createComponent(NewGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.gameSelected = {
            game1: true,
        };
        snackbarSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
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

    it('should connnect to the sever', async () => {
        const socketSpy = jasmine.createSpyObj('socket', ['connect']);
        component.socket = socketSpy;
        component.socket.connect();
        expect(socketSpy.connect).toHaveBeenCalled();
    });

    it('sould add the game to gamesId when deleted and should alert if gameSelected was deleted', async () => {
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
        const deletedGamesIdMock = ['1'];
        component.deletedGamesId = deletedGamesIdMock;
        const selectedGameMock = { '1': true };
        component.gameSelected = selectedGameMock;
        spyOn(snackbarSpy, 'openSnackBar');
        const deleteGameEventSpy = spyOn(component, 'deleteGameEvent');
        component.deleteGameEvent(gamesMock[0].id);
        expect(deleteGameEventSpy).toHaveBeenCalledWith(gamesMock[0].id);
    });

    it('should return the good index of the game', async () => {
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
        const indexOfSpy = spyOn(gamesMock, 'indexOf').and.callThrough();
        const result = gamesMock.indexOf(gamesMock[0]);
        expect(indexOfSpy).toHaveBeenCalled();
        expect(result).toEqual(0);
    });

});
