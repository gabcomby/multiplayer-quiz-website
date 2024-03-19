import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { GameService } from '@app/services/game.service';
import { ResultsViewComponent } from './results-view.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('ResultsViewComponent', () => {
    let component: ResultsViewComponent;
    let fixture: ComponentFixture<ResultsViewComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GameService', ['leaveRoom'], ['playerListValue']);

        await TestBed.configureTestingModule({
            declarations: [ResultsViewComponent, HistogramComponent],
            providers: [{ provide: GameService, useValue: spy }],
            imports: [MatToolbarModule, MatIconModule, MatTableModule, MatFormFieldModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
        fixture = TestBed.createComponent(ResultsViewComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call leaveRoom method of GameService', () => {
        component.handleGameLeave();
        expect(gameServiceSpy.leaveRoom).toHaveBeenCalled();
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
});
