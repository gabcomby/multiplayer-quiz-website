import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { InjectionToken, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ChoiceComponent } from './components/choice/choice.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { GamePageLivechatComponent } from './components/game-page-livechat/game-page-livechat.component';
import { GamePageQuestionsComponent } from './components/game-page-questions/game-page-questions.component';
import { GamePageScoresheetComponent } from './components/game-page-scoresheet/game-page-scoresheet.component';
import { GamePageTimerComponent } from './components/game-page-timer/game-page-timer.component';
import { InputDialogComponent } from './components/input-dialog/input-dialog.component';
import { ModifiedQuestionComponent } from './components/modified-question/modified-question.component';
import { NewQuestionComponent } from './components/new-question/new-question.component';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';
import { PlayerNameDialogComponent } from './components/player-name-dialog/player-name-dialog.component';
import { ServerErrorDialogComponent } from './components/server-error-dialog/server-error-dialog.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateQGamePageComponent } from './pages/create-qgame-page/create-qgame-page.component';
import { GameTestComponent } from './pages/game-test/game-test.component';
import { GameWaitComponent } from './pages/game-wait/game-wait.component';
import { ModifyQuestionQbankComponent } from './pages/modify-question-qbank/modify-question-qbank.component';
import { NewGamePageComponent } from './pages/new-game-page/new-game-page.component';
import { NewQuestionQbankComponent } from './pages/new-question-qbank/new-question-qbank.component';
import { QuestionBankComponent } from './pages/question-bank/question-bank.component';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

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
        PasswordDialogComponent,
        ModifiedQuestionComponent,
        QuestionBankComponent,
        NewQuestionQbankComponent,
        ModifyQuestionQbankComponent,
        ServerErrorDialogComponent,
        InputDialogComponent,
        ConfirmDialogComponent,
        PlayerNameDialogComponent,
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
        DragDropModule,
        MatListModule,
        RouterModule,
    ],
    providers: [{ provide: API_BASE_URL, useValue: 'http://localhost:3000' }],
    bootstrap: [AppComponent],
})
export class AppModule {}
