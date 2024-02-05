// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GameService } from '@app/services/games.service';
// import { PlayerService } from '@app/services/player.service';
// import { TimerService } from '@app/services/timer.service';
// import { of } from 'rxjs';
// import { GamePageComponent } from './game-page.component';

// const mockGameData = {
//     id: '1a2b3c',
//     title: 'Test Game',
//     description: 'Test game description',
//     isVisible: true,
//     duration: 30,
//     lastModification: new Date(),
//     questions: [
//         {
//             type: 'multiple-choice',
//             text: 'What is the capital of France?',
//             points: 10,
//             choices: [{ text: 'Paris', isCorrect: true }, { text: 'London' }, { text: 'Berlin' }, { text: 'Madrid' }],
//             previousIndex: 0,
//             currentIndex: 0,
//             lastModification: new Date(),
//             id: '1a2b3c',
//         },
//     ],
// };

// describe('GamePageComponent', () => {
//     let component: GamePageComponent;
//     let fixture: ComponentFixture<GamePageComponent>;
//     let gameServiceMock: jasmine.SpyObj<GameService>;
//     let playerServiceMock: jasmine.SpyObj<PlayerService>;
//     let timerServiceMock: jasmine.SpyObj<TimerService>;
//     let router: Router;

//     beforeEach(async () => {
//         // Create mocks
//         gameServiceMock = jasmine.createSpyObj('GameService', ['getGame']);
//         playerServiceMock = jasmine.createSpyObj('PlayerService', ['getPlayerName']);
//         timerServiceMock = jasmine.createSpyObj('TimerService', ['startTimer', 'killTimer']);
//         timerServiceMock.startTimer.and.returnValue(of(0));

//         await TestBed.configureTestingModule({
//             imports: [RouterTestingModule],
//             declarations: [GamePageComponent],
//             providers: [
//                 { provide: GameService, useValue: gameServiceMock },
//                 { provide: PlayerService, useValue: playerServiceMock },
//                 { provide: TimerService, useValue: timerServiceMock },
//                 // Remove the Router mock if not needed, or keep it if you have specific tests that require spying on navigate.
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(GamePageComponent);
//         component = fixture.componentInstance;
//         router = TestBed.inject(Router); // Get the actual router instance
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('initializePlayerScore', () => {
//         it('should initialize player score if player name exists', () => {
//             const playerName = 'John Doe';
//             playerServiceMock.getPlayerName.and.returnValue(playerName);
//             component.initializePlayerScore();
//             expect(component.gameScore.length).toBe(1);
//             expect(component.gameScore[0].name).toEqual(playerName);
//             expect(component.gameScore[0].score).toEqual(0);
//         });

//         it('should not initialize player score if player name does not exist', () => {
//             playerServiceMock.getPlayerName.and.returnValue('');
//             component.initializePlayerScore();
//             expect(component.gameScore.length).toBe(0);
//         });
//     });

//     describe('fetchGameData', () => {
//         it('should fetch game data successfully', () => {
//             gameServiceMock.getGame.and.returnValue(of(mockGameData));
//             spyOn(component, 'startQuestionTimer');

//             component.fetchGameData(mockGameData.id);

//             expect(gameServiceMock.getGame).toHaveBeenCalledWith(mockGameData.id);
//             expect(component.gameData).toEqual(mockGameData);
//             expect(component.startQuestionTimer).toHaveBeenCalled();
//         });
//     });

//     it('should navigate to the home page after leaving the game', () => {
//         const spy = spyOn(router, 'navigate');
//         component.handleGameLeave();
//         expect(spy).toHaveBeenCalledWith(['/']);
//     });

//     // Add more tests for other methods and behaviors of the component...
// });
