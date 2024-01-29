import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { GamePageLivechatComponent } from './game-page-livechat.component';

const DISAPPEAR_DELAY = 10000;

describe('GamePageLivechatComponent', () => {
    let component: GamePageLivechatComponent;
    let fixture: ComponentFixture<GamePageLivechatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageLivechatComponent],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageLivechatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add a new message when sendMessage is called', () => {
        component.newMessage = 'Test message';
        component.sendMessage();
        expect(component.messages.length).toBe(1);
        expect(component.messages[0].text).toBe('Test message');
    });

    it('should not add a message if newMessage is empty or only whitespace', () => {
        const initialLength = component.messages.length;

        component.newMessage = '';
        component.sendMessage();
        expect(component.messages.length).toBe(initialLength);

        component.newMessage = '    ';
        component.sendMessage();
        expect(component.messages.length).toBe(initialLength);
    });

    it('should remove a message after the specified delay', fakeAsync(() => {
        component.newMessage = 'Test message';
        component.sendMessage();
        expect(component.messages.length).toBe(1);
        tick(DISAPPEAR_DELAY);
        expect(component.messages.length).toBe(0);
    }));
});
