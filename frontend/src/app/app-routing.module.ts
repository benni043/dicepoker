import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {NotFoundComponent} from "./not-found/not-found.component";
import {GameComponent} from "./game/game/game.component";
import {LobbyComponent} from "./lobby/lobby/lobby.component";

const routes: Routes = [
  {path: '', component: LobbyComponent},
  {path: 'game', component: GameComponent},
  {path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
