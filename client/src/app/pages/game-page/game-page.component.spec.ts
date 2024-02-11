import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatchService } from '@app/services/match.service';
import { SocketService } from '@app/services/socket.service';
import { GamePageComponent } from './game-page.component';

const TEN = 10;

// const questionMock: Question[] = [
//     {
//         type: 'multiple-choice',
//         text: 'Question 1?',
//         points: 10,
//         choices: [
//             { text: 'Answer 1', isCorrect: false },
//             { text: 'Answer 2', isCorrect: true },
//         ],
//         lastModification: new Date(),
//         id: 'q1',
//     },
// ];
// const mockedGameData: Game = {
//     id: 'game123',
//     title: 'Test Game',
//     description: 'This is a test game',
//     isVisible: true,
//     duration: 30,
//     lastModification: new Date(),
//     questions: questionMock,
// };
const mockedMatchData = {
    id: 'match123',
    playerList: [],
};
const updatedMatchDataWithPlayer = {
    ...mockedMatchData,
    playerList: [{ id: 'playertest', name: 'Player 1', score: 0 }],
};

import { of } from 'rxjs'; // Import the 'of' function from RxJS to mock Observables

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let matchService: jasmine.SpyObj<MatchService>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        matchService = jasmine.createSpyObj('MatchService', ['createNewMatch', 'addPlayer', 'deleteMatch', 'updatePlayerScore']);
        socketService = jasmine.createSpyObj('SocketService', [
            'connect',
            'disconnect',
            'startTimer',
            'stopTimer',
            'onTimerCountdown',
            'onAnswerVerification',
            'setTimerDuration',
        ]);

        // Mock the API calls to return Observables of mock data
        matchService.createNewMatch.and.returnValue(of(mockedMatchData));
        matchService.addPlayer.and.returnValue(of(updatedMatchDataWithPlayer));

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MatchService, useValue: matchService },
                { provide: SocketService, useValue: socketService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly initialize match and add player on init', () => {
        spyOn(component, 'createMatch').and.callThrough();
        spyOn(component, 'addPlayerToMatch').and.callThrough();

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(matchService.createNewMatch).toHaveBeenCalledWith({ id: jasmine.any(String), playerList: [] });
            expect(matchService.addPlayer).toHaveBeenCalledWith({ id: 'playertest', name: 'Player 1', score: 0 }, jasmine.any(String));

            expect(component.currentMatch).toEqual(updatedMatchDataWithPlayer);

            expect(component.createMatch).toHaveBeenCalled();
            expect(component.addPlayerToMatch).toHaveBeenCalledWith(component.matchId);
        });
    });

    it('should correctly update player score', () => {
        spyOn(component, 'updatePlayerScore').and.callThrough();

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            component.updatePlayerScore(TEN);

            expect(matchService.updatePlayerScore).toHaveBeenCalledWith(component.matchId, 'playertest', TEN);
            expect(component.updatePlayerScore).toHaveBeenCalledWith(TEN);
        });
    });
});
