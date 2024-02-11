// // pour autre route
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { Game, Question } from '@app/interfaces/game';
// import { GameService } from '@app/services/game.service';
// import { QuestionService } from '@app/services/question.service';
// import * as gameUtilsModule from '@app/utils/is-valid-game';
// import { of } from 'rxjs';
// import { CreateQGamePageComponent } from './create-qgame-page.component';

// import SpyObj = jasmine.SpyObj;
// describe('CreateQGamePageComponent', () => {
//     let questionServiceSpy: SpyObj<QuestionService>;
//     let gameServiceSpy: SpyObj<GameService>;
//     let component: CreateQGamePageComponent;
//     let fixture: ComponentFixture<CreateQGamePageComponent>;
//     const defaultDate = new Date();

//     beforeEach(() => {
//         questionServiceSpy = jasmine.createSpyObj('QuestionService', {
//             addQuestion: {},
//             updateList: {},
//             getQuestion: [
//                 {
//                     type: 'QCM',
//                     text: 'Ceci est une question de test',
//                     points: 10,
//                     id: 'dsdsd',
//                     lastModification: defaultDate,
//                 } as Question,
//             ],
//             resetQuestions: {},
//         });
//         gameServiceSpy = jasmine.createSpyObj('GameService', {
//             getGames: [],
//             // eslint-disable-next-line no-unused-vars
//             createGame: (game: Game) => {
//                 return;
//             },
//         });
//     });
//     beforeEach(waitForAsync(() => {
//         TestBed.configureTestingModule({
//             declarations: [CreateQGamePageComponent],
//             providers: [
//                 { provide: QuestionService, useValue: questionServiceSpy },
//                 { provide: GameService, useValue: gameServiceSpy },
//                 { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: null })) } },
//             ],
//             imports: [HttpClientTestingModule],
//         }).compileComponents();
//     }));
//     beforeEach(() => {
//         fixture = TestBed.createComponent(CreateQGamePageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should call createGame from GameService when onSubmit is called with validData', () => {
//         spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
//         component.onSubmit().then(() => {
//             expect(component.gameId).toBe(null);
//             fixture.detectChanges();
//             expect(gameServiceSpy.createGame).toHaveBeenCalled();
//         });
//     });
// });
