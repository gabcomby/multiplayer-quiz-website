import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamePageLivechatComponent } from './game-page-livechat.component';
import { FormsModule } from '@angular/forms';

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
});
