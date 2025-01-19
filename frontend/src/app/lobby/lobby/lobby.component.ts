import { Component } from '@angular/core';
import {RouterService} from "../../router.service";
import {LobbyRouterService} from "../../lobby-router.service";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  constructor(public routerService: RouterService, public lobbyRouterService: LobbyRouterService) {
  }

  newGame: boolean = false;

  back() {
    window.location.reload()
  }

}
