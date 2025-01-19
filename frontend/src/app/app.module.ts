import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { FieldComponent } from './game/field/field.component';
import { JoinComponent } from './lobby/join/join.component';
import { CreateComponent } from './lobby/create/create.component';
import { DiceComponent } from './game/dice/dice.component';
import {NgOptimizedImage} from "@angular/common";
import { AlertComponent } from './alert/alert.component';
import { DisplayDiceNewComponent } from './game/display-dice-new/display-dice-new.component';
import { AppRoutingModule } from './app-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { LobbyComponent } from './lobby/lobby/lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    FieldComponent,
    JoinComponent,
    CreateComponent,
    DiceComponent,
    AlertComponent,
    DisplayDiceNewComponent,
    NotFoundComponent,
    LobbyComponent
  ],
    imports: [
        BrowserModule,
        FormsModule,
        NgOptimizedImage,
        AppRoutingModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
