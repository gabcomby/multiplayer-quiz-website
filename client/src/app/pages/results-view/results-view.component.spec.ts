import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { GameService } from '@app/services/game.service';
import { ResultsViewComponent } from './results-view.component';

describe('ResultsViewComponent', () => {
    let component: ResultsViewComponent;
    let fixture: ComponentFixture<ResultsViewComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', {
            leaveRoom: undefined,
        });
        TestBed.configureTestingModule({
            declarations: [ResultsViewComponent, HistogramComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
            imports: [MatToolbarModule, MatIconModule, MatTableModule],
        });
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

    // it('should return player list from GameService', () => {
    //     const playerList = [
    //         {
    //             id: 'player1',
    //             name: 'John',
    //             score: 12,
    //             bonus: 0,
    //         },
    //         {
    //             id: 'player2',
    //             name: 'Alice',
    //             score: 20,
    //             bonus: 0,
    //         },
    //     ];
    //     spyOnProperty(gameServiceSpy, 'playerListValue').and.returnValue(playerList);
    //     expect(component.playerList).toEqual(playerList);
    // });

    // it('should return currentQuestionIndexValue from gameService with currentQuestionIndexValue', () => {
    //     // eslint-disable-next-line no-unused-vars
    //     const result = component.playerList;
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const sortDataSourceSpy = spyOn<any>(component, 'sortDataSource').and.callThrough();
    //     expect(sortDataSourceSpy).toHaveBeenCalled();
    //     expect(component.playerDataSource).toBe(gameServiceSpy.playerListValue);
    // });

    // it('should return all answers index from GameService', () => {
    //     spyOnProperty(gameServiceSpy, 'allAnswersIndexValue', 'get').and.returnValue([
    //         ['answer1', [1, 2, 3]],
    //         ['answer2', [4, 5, 6]],
    //     ]);
    //     expect(component.allAnswersIndex).toEqual([
    //         ['answer1', [1, 2, 3]],
    //         ['answer2', [4, 5, 6]],
    //     ]);
    // });
    // it('should return all answers index from GameService', () => {
    //     const answersIndex = [
    //         ['Player A', [0, 1, 2]],
    //         ['Player B', [1, 2, 3]],
    //     ];
    //     spyOnProperty(component.gameService, 'allAnswersIndexValue').and.returnValue(answersIndex);
    //     expect(component.allAnswersIndex).toEqual(answersIndex);
    // });

    // it('should return all questions from GameService', () => {
    //     const questions = [{ text: 'Question 1' }, { text: 'Question 2' }];
    //     spyOnProperty(component.gameService, 'allQuestionsFromGameValue').and.returnValue(questions);
    //     expect(component.allQuestionsFromGame).toEqual(questions);
    // });
});
//     it('should return player list value from game service', () => {
//         const players: Player[] = [
//             {
//                 id: 'player1',
//                 name: 'John',
//                 score: 0,
//                 bonus: 0,
//                 isLocked: false,
//             },
//             {
//                 id: 'player2',
//                 name: 'Alice',
//                 score: 0,
//                 bonus: 0,
//                 isLocked: false,
//             },
//         ];
//         spyOnProperty(gameService, 'playerListFromLobby', 'get').and.returnValue(players);
//         const playerListValue = component.playerListValue;
//         expect(playerListValue).toEqual(players);
//     });

//     it('should call handleGameLeave of GameService', () => {
//         spyOn(gameService, 'handleGameLeave');
//         component.handleGameLeave();
//         expect(gameService.handleGameLeave).toHaveBeenCalled();
//     });

//     it('should update answersQuestions when getPlayerAnswers emits', () => {
//         const mockAnswers: AnswersPlayer[] = [
//             new Map<string, number[]>([
//                 ['player1', [1, 2, 3]],
//                 ['player2', [1, 2, 3]],
//             ]),
//             new Map<string, number[]>([
//                 ['player3', [1, 2, 3]],
//                 ['player4', [1, 2, 3]],
//             ]),
//         ];
//         spyOn(gameService, 'getPlayerAnswers').and.returnValue(of(mockAnswers));
//         component.ngOnInit();
//         expect(component.answersQuestions).toEqual(mockAnswers);
//     });

//     it('should update questions when questionGame emits', () => {
//         const fakeQuestions: Question[] = [
//             {
//                 type: 'Multiple Choice',
//                 text: 'What is the capital of France?',
//                 points: 10,
//                 choices: [
//                     { text: 'Paris', isCorrect: true },
//                     { text: 'London', isCorrect: false },
//                     { text: 'Berlin', isCorrect: false },
//                     { text: 'Rome', isCorrect: false },
//                 ],
//                 lastModification: new Date(),
//                 id: '1',
//             },
//             {
//                 type: 'True/False',
//                 text: 'The Earth is flat.',
//                 points: 5,
//                 choices: [
//                     { text: 'True', isCorrect: false },
//                     { text: 'False', isCorrect: true },
//                 ],
//                 lastModification: new Date(),
//                 id: '2',
//             },
//         ];

//         gameService.questionGame.next(fakeQuestions);

//         component.ngOnInit();

//         expect(component.questions).toEqual(fakeQuestions);
//     });

//     it('should sort dataSource correctly', () => {
//         const unsortedPlayers: Player[] = [
//             { name: 'Player 1', score: 10, id: 'a', bonus: 1 },
//             { name: 'Player 3', score: 5, id: 'b', bonus: 2 },
//             { name: 'Player 2', score: 10, id: 'c', bonus: 1 },
//         ];
//         const sortedPlayers: Player[] = [
//             { name: 'Player 1', score: 10, id: 'a', bonus: 1 },
//             { name: 'Player 2', score: 10, id: 'c', bonus: 1 },
//             { name: 'Player 3', score: 5, id: 'b', bonus: 2 },
//         ];

//         component.dataSource = unsortedPlayers;
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const sortDataSourceSpy = spyOn<any>(component, 'sortDataSource').and.callThrough();
//         sortDataSourceSpy.call(component);
//         expect(sortDataSourceSpy).toHaveBeenCalled();
//         expect(component.dataSource).toEqual(sortedPlayers);
//     });
// });
