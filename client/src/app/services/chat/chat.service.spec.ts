import { TestBed } from '@angular/core/testing';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DISAPPEAR_DELAY } from '@app/config/client-config';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of, throwError } from 'rxjs';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        const SPY_SNACKBAR_SERVICE = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const SPY_SOCKET_SERVICE = jasmine.createSpyObj('SocketService', ['onChatMessage', 'onSystemMessage', 'sendMessageToServer']);

        SPY_SOCKET_SERVICE.onChatMessage.and.returnValue(of({ text: 'test', sender: 'test', timestamp: new Date() }));

        jasmine.clock().install();

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: SnackbarService, useValue: SPY_SNACKBAR_SERVICE },
                { provide: SocketService, useValue: SPY_SOCKET_SERVICE },
            ],
            imports: [MatSnackBarModule],
        });
        service = TestBed.inject(ChatService);
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should listen for messages', () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service['listenForSystemMessages'] = jasmine.createSpy();
        service.listenForMessages();
        expect(socketServiceSpy.onChatMessage).toHaveBeenCalled();
    });

    it('should send message', () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.sendMessage({ text: 'test', playerName: 'test', roomId: 'test', isHost: true });
        expect(socketServiceSpy.sendMessageToServer).toHaveBeenCalled();
    });

    it('should send message with the name organisateur if host', () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.sendMessage({ text: 'test', playerName: 'test', roomId: 'test', isHost: true });
        expect(socketServiceSpy.sendMessageToServer).toHaveBeenCalledWith('test', 'Organisateur', 'test');
    });

    it('should send message with the player name if not host', () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.sendMessage({ text: 'test', playerName: 'test', roomId: 'test', isHost: false });
        expect(socketServiceSpy.sendMessageToServer).toHaveBeenCalledWith('test', 'test', 'test');
    });

    it('should handle system messages correctly', () => {
        const systemMessage = { text: 'System message', sender: 'System', timestamp: new Date(), visible: true };
        socketServiceSpy.onSystemMessage.and.returnValue(of(systemMessage));

        service.listenForMessages();
        expect(service.messagesSubject.value).toContain(systemMessage);
    });

    it('should handle new message', () => {
        const initialTimestamp = new Date();
        const message = { text: 'test', sender: 'test', timestamp: initialTimestamp };
        service['handleNewMessage'](message);

        const expectedMessage = {
            ...message,
            timestamp: jasmine.any(Date),
            visible: true,
        };

        expect(service.messagesSubject.value[0]).toEqual(expectedMessage);
    });

    it('should hide message', () => {
        const initialTimestamp = new Date();
        const message = { text: 'test', sender: 'test', timestamp: initialTimestamp };
        service['handleNewMessage'](message);
        const messageToHide = service.messagesSubject.value[0];
        service['hideMessage'](messageToHide);

        expect(service.messagesSubject.value[0].visible).toBeFalse();
    });

    it("shouldn't send message if the playerNmae is empty", () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.sendMessage({ text: 'test', playerName: '', roomId: 'test', isHost: false });
        expect(socketServiceSpy.sendMessageToServer).not.toHaveBeenCalled();
    });

    it('should handle error when listening for messages fails', () => {
        socketServiceSpy.onChatMessage.and.returnValue(throwError(() => new Error('Error')));
        socketServiceSpy.onSystemMessage.and.returnValue(throwError(() => new Error('Error')));

        service.listenForMessages();
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Pas de salle, vos messages ne seront pas envoyés');
    });

    it('should hide a new message after DISAPPEAR_DELAY', () => {
        const testMessage = { text: 'Test message', sender: 'Tester', timestamp: new Date().toISOString(), visible: true };
        service['handleNewMessage'](testMessage);

        jasmine.clock().tick(DISAPPEAR_DELAY);

        const messages = service.messagesSubject.value;
        expect(messages[messages.length - 1].visible).toBeFalse();
    });

    it('should not send message if not host and no playerName provided', () => {
        const text = 'Hello World';
        const playerName = '';
        const roomId = '123';
        const isHost = false;

        service.sendMessage({ text, playerName, roomId, isHost });

        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Vous êtes déconnecté du chat, vos messages ne seront pas envoyés');
        expect(socketServiceSpy.sendMessageToServer).not.toHaveBeenCalled();
    });

    it('should stop listening for messages', () => {
        socketServiceSpy.onChatMessage.and.returnValue(of({ text: 'test', sender: 'Système', timestamp: '24:11:34' }));

        service['listenForSystemMessages'] = jasmine.createSpy();
        service.listenForMessages();
        service.stopListeningForMessages();
        expect(service['listenToMessageSubscription']?.closed).toBeTrue();
    });
});
