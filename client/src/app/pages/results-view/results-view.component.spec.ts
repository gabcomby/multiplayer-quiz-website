import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { GameService } from '@app/services/game/game.service';
import { ResultsViewComponent } from './results-view.component';

describe('ResultsViewComponent', () => {
    let component: ResultsViewComponent;
    let fixture: ComponentFixture<ResultsViewComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GameService', ['leaveRoom'], ['playerListValue']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let store: any = {};
        const mockLocalStorage = {
            getItem: (key: string): string => {
                return key in store ? store[key] : null;
            },
            setItem: (key: string, value: string) => {
                store[key] = `${value}`;
            },
            removeItem: (key: string) => {
                delete store[key];
            },
            clear: () => {
                store = {};
            },
        };

        spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
        spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
        spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
        spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

        await TestBed.configureTestingModule({
            declarations: [ResultsViewComponent, HistogramComponent],
            providers: [
                { provide: GameService, useValue: spy },
                { provide: Router, useValue: routerSpyObj },
            ],
            imports: [MatToolbarModule, MatIconModule, MatTableModule, MatFormFieldModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(ResultsViewComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call leaveRoom method of GameService', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should sort players by score and name based on score if not the same', () => {
        component.playerDataSource = [
            {
                id: 'player1',
                name: 'John',
                score: 12,
                bonus: 0,
            },
            {
                id: 'player2',
                name: 'Alice',
                score: 20,
                bonus: 0,
            },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortDataSourceSpy = spyOn<any>(component, 'sortDataSource').and.callThrough();
        sortDataSourceSpy.call(component);
        expect(component.playerDataSource[0].name).toBe('Alice');
        expect(component.playerDataSource[1].name).toBe('John');
    });

    it('should sort players by name if score is the same', () => {
        component.playerDataSource = [
            {
                id: 'player1',
                name: 'John',
                score: 20,
                bonus: 0,
            },
            {
                id: 'player2',
                name: 'Alice',
                score: 20,
                bonus: 0,
            },
            {
                id: 'player2',
                name: 'Abi',
                score: 20,
                bonus: 0,
            },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortDataSourceSpy = spyOn<any>(component, 'sortDataSource').and.callThrough();
        sortDataSourceSpy.call(component);
        expect(component.playerDataSource[0].name).toBe('Abi');
        expect(component.playerDataSource[1].name).toBe('Alice');
        expect(component.playerDataSource[2].name).toBe('John');
    });

    it('should return player list from GameService', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortDataSourceSpy = spyOn<any>(component, 'sortDataSource').and.callFake(() => {
            return;
        });

        sortDataSourceSpy.call(component);
        const result = component.playerList;

        expect(result).toEqual(gameServiceSpy.playerListValue);
    });
    it('should return all answers index from GameService', () => {
        const result = component.allAnswersIndex;
        expect(result).toEqual(gameServiceSpy.allAnswersIndexValue);
    });

    it('should return all questions from GameService', () => {
        const result = component.allQuestionsFromGame;
        expect(result).toEqual(gameServiceSpy.allQuestionsFromGameValue);
    });

    it('should return the player name', () => {
        const result = component.playerName;
        expect(result).toEqual(gameServiceSpy.playerNameValue);
    });

    it('should return the lobby code', () => {
        const result = component.lobbyCode;
        expect(result).toEqual(gameServiceSpy.lobbyCodeValue);
    });

    it('should return the host value', () => {
        const result = component.isHostValue;
        expect(result).toEqual(gameServiceSpy.isHostValue);
    });

    it('should not navigate on ngOnInit if refreshedPage is not present', () => {
        component.ngOnInit();

        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to a page held in localStorage on ngOnInit if refreshedPage is present', () => {
        localStorage.setItem('refreshedPage', '/home');
        component.ngOnInit();

        expect(localStorage.removeItem).toHaveBeenCalledWith('refreshedPage');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should call leaveRoom and set refreshedPage on beforeUnloadHandler', () => {
        const event = new Event('beforeunload');
        component.beforeUnloadHandler(event);

        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith('refreshedPage', '/home');
    });
});
