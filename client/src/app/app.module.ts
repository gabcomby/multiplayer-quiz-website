import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ChoiceComponent } from './components/choice/choice.component';
import { GamePageLivechatComponent } from './components/game-page-livechat/game-page-livechat.component';
import { GamePageQuestionsComponent } from './components/game-page-questions/game-page-questions.component';
import { GamePageScoresheetComponent } from './components/game-page-scoresheet/game-page-scoresheet.component';
import { GamePageTimerComponent } from './components/game-page-timer/game-page-timer.component';
import { NewQuestionComponent } from './components/new-question/new-question.component';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateQGamePageComponent } from './pages/create-qgame-page/create-qgame-page.component';
import { GameTestComponent } from './pages/game-test/game-test.component';
import { GameWaitComponent } from './pages/game-wait/game-wait.component';
import { NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { QuestionsPageComponent } from './pages/questions-page/questions-page.component';
import { ModifiedQuestionComponent } from './components/modified-question/modified-question.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        GamePageLivechatComponent,
        AdminPageComponent,
        NewGamePageComponent,
        CreateQGamePageComponent,
        NewQuestionComponent,
        ChoiceComponent,
        CreateQGamePageComponent,
        GamePageQuestionsComponent,
        GamePageTimerComponent,
        GamePageScoresheetComponent,
        GameTestComponent,
        GameWaitComponent,
        QuestionsPageComponent,
        PasswordDialogComponent,
        ModifiedQuestionComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
