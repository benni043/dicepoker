import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { FieldComponent } from './field/field.component';
import { JoinComponent } from './join/join.component';
import { CreateComponent } from './create/create.component';
import { DiceComponent } from './dice/dice.component';
import { DiceDisplayComponent } from './dice-display/dice-display.component';
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
    DiceDisplayComponent,
    AlertComponent,
    DisplayDiceNewComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgOptimizedImage
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
