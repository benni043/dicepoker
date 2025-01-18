import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { FieldComponent } from './field/field.component';
import { JoinComponent } from './lobby/join/join.component';
import { CreateComponent } from './lobby/create/create.component';
import { DiceComponent } from './dice/dice.component';
import {NgOptimizedImage} from "@angular/common";
import { AlertComponent } from './alert/alert.component';
import { DisplayDiceNewComponent } from './display-dice-new/display-dice-new.component';

@NgModule({
  declarations: [
    AppComponent,
    FieldComponent,
    JoinComponent,
    CreateComponent,
    DiceComponent,
    AlertComponent,
    DisplayDiceNewComponent
  ],
    imports: [
        BrowserModule,
        FormsModule,
        NgOptimizedImage
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
