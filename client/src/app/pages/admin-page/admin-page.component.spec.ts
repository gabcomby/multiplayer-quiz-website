import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { AdminPageComponent } from './admin-page.component';

const mockData = {
    id: '1zkjdm',
    title: 'VISIBILITY TEST',
    isVisible: false,
    description: 'asdfasdfasdfasd',
    duration: 10,
    lastModification: new Date('2024-02-12T14:48:55.329Z'),
    questions: [
        {
            type: 'QCM',
            text: 'test retour',
            points: 10,
            lastModification: new Date('2024-02-12T14:48:55.329Z'),
            id: 'vdkp2a',
            choices: [
                { text: 'ca marche', isCorrect: true },
                { text: 'ou pas', isCorrect: false },
            ],
        },
        {
            type: 'QCM',
            text: ' cv',
            points: 10,
            lastModification: new Date('2024-02-12T14:48:55.329Z'),
            id: 'fjfdl1',
            choices: [
                { text: 'c dvfb', isCorrect: true },
                { text: 'hola', isCorrect: true },
                { text: 'rghtyj', isCorrect: false },
            ],
        },
        {
            type: 'QCM',
            text: 'test2',
            points: 10,
            lastModification: new Date('2024-02-12T14:48:55.329Z'),
            id: 'jssar7',
            choices: [
                { text: 'cdcd==', isCorrect: true },
                { text: 'ouioui', isCorrect: true },
                { text: 'cdcd', isCorrect: false },
            ],
        },
        {
            type: 'QCM',
            text: 'Quelle est la capitale du Canada?',
            points: 10,
            lastModification: new Date('2024-02-05T00:58:28.573Z'),
            id: 'qrvbvo',
            choices: [
                { text: 'Toronto', isCorrect: false },
                { text: 'Ottawa', isCorrect: true },
            ],
        },
    ],
};

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    const gameServiceMock = jasmine.createSpyObj('gameService', ['patchGame', 'getGames']);
    const snackbarServiceMock = jasmine.createSpyObj('snackbarService', ['openSnackBar']);
    const socketServiceMock = jasmine.createSpyObj('socketService', ['connect']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule],
            providers: [
                {
                    provide: GameService,
                    useValue: gameServiceMock,
                },
                {
                    provide: SnackbarService,
                    useValue: snackbarServiceMock,
                },
                {
                    provide: SocketService,
                    useValue: socketServiceMock,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        fixture.detectChanges();
        component.dataSource = [mockData];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle visibility', () => {
        gameServiceMock.patchGame.and.returnValue(Promise.resolve());
        component.toggleVisibility('1zkjdm', true);
        expect(gameServiceMock.patchGame).toHaveBeenCalled();
    });

    it('should call importGamesFromFile when onFileSelected is called', () => {
        const event = {
            target: {
                files: [{ name: 'test' }],
            },
        } as unknown as Event;
        const spy = spyOn(component, 'importGamesFromFile');
        component.onFileSelected(event);
        expect(spy).toHaveBeenCalled();
    });

    it("should delete unwanted fields from game's json", () => {
        const game = { ...mockData, _id: '1' };
        gameServiceMock.patchGame.and.returnValue(Promise.resolve());
        const result = component['removeUnwantedFields'](game);
        expect(result).toEqual(mockData);
    });
});
