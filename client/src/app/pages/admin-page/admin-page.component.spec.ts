import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

const mockData = {
    id: '1zkjdm',
    title: 'VISIBILITY TEST',
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
} as Game;

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let router: Router;
    let snackbarServiceMock: jasmine.SpyObj<SnackbarService>;

    const matDialogMock = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
    const gameServiceMock = jasmine.createSpyObj('gameService', [
        'patchGame',
        'getGames',
        'deleteGame',
        'getGame',
        'createGame',
        'validateDuplicationGame',
    ]);
    const socketServiceMock = jasmine.createSpyObj('socketService', ['connect']);
    const dialogMock = {
        open: () => {
            return { afterClosed: () => of(true) };
        },
    };

    beforeEach(async () => {
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);

        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule, MatDialogModule, MatTableModule, MatIconModule],
            providers: [
                {
                    provide: GameService,
                    useValue: gameServiceMock,
                },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                {
                    provide: SocketService,
                    useValue: socketServiceMock,
                },
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        fixture.detectChanges();
        component.dataSource = [mockData as Game];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should populate dataSource with games' data", async () => {
        gameServiceMock.getGames.and.returnValue(Promise.resolve([mockData]));
        await component.ngOnInit();
        expect(component.dataSource).toEqual([mockData]);
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

    it('should call getGameTitle when getValidGameTitle is called', async () => {
        const spy = spyOn(component, 'getValidGameTitle');
        await component.getValidGameTitle(mockData);
        expect(spy).toHaveBeenCalled();
    });

    it('should navigate to create-qgame when createGame is called', () => {
        component.createGame();
        expect(router.navigate).toHaveBeenCalledWith(['/create-qgame']);
    });
    it('should delete a game when confirmed', async () => {
        gameServiceMock.deleteGame.and.returnValue(Promise.resolve());
        matDialogMock.open.and.returnValue({ afterClosed: () => of(true) });
        await component.deleteGame('1zkjdm');

        expect(gameServiceMock.deleteGame).toHaveBeenCalled();
    });

    it("should validate game's title", async () => {
        const spy = spyOn(component, 'getValidGameTitle');
        await component.getValidGameTitle(mockData);
        expect(spy).toHaveBeenCalled();
    });

    it('should return a new valid game title immediately', async () => {
        matDialogMock.open.and.returnValue({
            afterClosed: () => of('New Valid Title'),
        });

        const originalGame = { title: 'Original Game Title' } as Partial<Game>;
        const newTitle = await component.getValidGameTitle(originalGame as Game);

        expect(newTitle).toEqual('New Valid Title');
        expect(matDialogMock.open).toHaveBeenCalled();
    });

    it('should handle cancellation', async () => {
        matDialogMock.open.and.returnValue({
            afterClosed: () => of(null),
        });

        const originalGame = { title: 'Original Game Title' } as Partial<Game>;
        const newTitle = await component.getValidGameTitle(originalGame as Game);

        expect(newTitle).toBeNull();
        expect(matDialogMock.open).toHaveBeenCalled();
    });

    it('should handle empty string', async () => {
        matDialogMock.open.and.returnValue({
            afterClosed: () => of(''),
        });

        const originalGame = { title: 'Original Game Title' } as Partial<Game>;
        const newTitle = await component.getValidGameTitle(originalGame as Game);

        expect(newTitle).toBeNull();
        expect(matDialogMock.open).toHaveBeenCalled();
    });
});
