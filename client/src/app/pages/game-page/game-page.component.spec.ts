import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GamePageLivechatComponent } from '@app/components/game-page-livechat/game-page-livechat.component';
import { GamePageComponent } from './game-page.component';
import { FormsModule } from '@angular/forms';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, GamePageLivechatComponent, PlayAreaComponent],
            imports: [FormsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
