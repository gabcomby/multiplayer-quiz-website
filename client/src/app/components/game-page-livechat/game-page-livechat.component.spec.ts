// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { MatIconModule } from '@angular/material/icon';
// import { GamePageLivechatComponent } from './game-page-livechat.component';

// const DISAPPEAR_DELAY = 10000;

// describe('GamePageLivechatComponent', () => {
//     let component: GamePageLivechatComponent;
//     let fixture: ComponentFixture<GamePageLivechatComponent>;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [GamePageLivechatComponent],
//             imports: [FormsModule, MatIconModule],
//             schemas: [NO_ERRORS_SCHEMA],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(GamePageLivechatComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should add a new message when sendMessage is called', () => {
//         component.newMessage = 'Test message';
//         component.sendMessage();
//         expect(component.messages.length).toBe(1);
//         expect(component.messages[0].text).toBe('Test message');
//     });

//     it('should not add a message if newMessage is empty or only whitespace', () => {
//         const initialLength = component.messages.length;

//         component.newMessage = '';
//         component.sendMessage();
//         expect(component.messages.length).toBe(initialLength);

//         component.newMessage = '    ';
//         component.sendMessage();
//         expect(component.messages.length).toBe(initialLength);
//     });

//     it('should remove a message after the specified delay', fakeAsync(() => {
//         component.newMessage = 'Test message';
//         component.sendMessage();
//         expect(component.messages.length).toBe(1);
//         tick(DISAPPEAR_DELAY);
//         expect(component.messages.length).toBe(0);
//     }));

//     it('should send a message when enter is pressed', () => {
//         const event = new KeyboardEvent('keypress', { key: 'Enter' });
//         spyOn(component, 'sendMessage');
//         component.onChatEnterPressed(event);
//         expect(component.sendMessage).toHaveBeenCalled();
//     });

//     it('should focus the textbox when chat is clicked', () => {
//         const focusSpy = spyOn(component.textbox.nativeElement, 'focus');
//         component.onChatClick();
//         expect(focusSpy).toHaveBeenCalled();
//     });
// });
