/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Question } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
// import * as gameUtilsModule from '@app/utils/is-valid-game';
import { API_BASE_URL } from '@app/app.module';
import { of } from 'rxjs';
import { CreateQGamePageComponent } from './create-qgame-page.component';

@Component({
    selector: 'app-modified-question',
    template: '',
})
class AppModifiedQuestionStubComponent {
    @Input() questions: unknown[];
}

@Component({
    selector: 'app-new-question',
    template: '',
})
class AppNewQuestionStubComponent {
    @Input() formBank: unknown[];
}

import SpyObj = jasmine.SpyObj;
describe('CreateQGamePageComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let gameServiceSpy: SpyObj<GameService>;
    let snackbarServiceMock: SpyObj<SnackbarService>;
    let routerSpy: SpyObj<Router>;

    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;
    const defaultDate = new Date();

    beforeEach(() => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            updateList: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    lastModification: defaultDate,
                } as Question,
            ],
            resetQuestions: {},
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', {
            getGames: [],
            isValidGame: {},
            createGame: {},
            createNewGame: {},
        });
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent, AppModifiedQuestionStubComponent, AppNewQuestionStubComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: null })) } },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
                { provide: MatDialog, useValue: { open: (_comp: unknown, _obj: unknown) => {} } },
                { provide: Router, useValue: routerSpy },
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
            ],
            imports: [HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call createGame from GameService when onSubmit is called with validData', async () => {
        component.gameId = null;
        gameServiceSpy.isValidGame.and.returnValue(Promise.resolve(true));
        await component.onSubmit();
        expect(gameServiceSpy.createNewGame).toHaveBeenCalled();
        expect(gameServiceSpy.createGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalled();
    });
    it('should throw error if submitting with the server down', async () => {
        gameServiceSpy.isValidGame.and.throwError('test error');
        spyOn(component, 'handleServerError');
        try {
            await component.onSubmit();
        } catch (error) {
            expect(component.handleServerError).toHaveBeenCalled();
        }
    });
});
