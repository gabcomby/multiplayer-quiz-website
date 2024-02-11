import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game, Question } from '@app/interfaces/game'; // Assuming the path is correct
import { GameService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { SocketService } from '@app/services/socket.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameService: jasmine.SpyObj<GameService>;
    let matchService: jasmine.SpyObj<MatchService>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        gameService = jasmine.createSpyObj('GameService', ['getGame']);
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

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: GameService, useValue: gameService },
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

    it('should fetch game data and set up a match on init', async () => {
        const questionMock: Question[] = [
            {
                type: 'multiple-choice',
                text: 'Question 1?',
                points: 10,
                choices: [
                    { text: 'Answer 1', isCorrect: false },
                    { text: 'Answer 2', isCorrect: true },
                ],
                lastModification: new Date(),
                id: 'q1',
            },
        ];
        const mockedGameData: Game = {
            id: 'game123',
            title: 'Test Game',
            description: 'This is a test game',
            isVisible: true,
            duration: 30,
            lastModification: new Date(),
            questions: questionMock,
        };
        const mockedMatchData = {
            id: 'match123',
            playerList: [],
        };
        const updatedMatchDataWithPlayer = {
            ...mockedMatchData,
            playerList: [{ id: 'playertest', name: 'Player 1', score: 0 }],
        };

        fixture.detectChanges();

        await fixture.whenStable();

        expect(gameService.getGame).toHaveBeenCalledWith('testGameId');
        expect(matchService.createNewMatch).toHaveBeenCalled();
        expect(matchService.addPlayer).toHaveBeenCalledWith({ id: 'playertest', name: 'Player 1', score: 0 }, jasmine.any(String));

        expect(component.gameData).toEqual(mockedGameData);
        expect(component.currentMatch).toEqual(updatedMatchDataWithPlayer);
    });
});
