import { Component } from '@angular/core';
import {RouterService} from "../../router.service";
import {LobbyRouterService} from "../../lobby-router.service";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent {

  playerName: string = "";
  serverName: string = "";

  constructor(public routerService: RouterService, public lobbyRouterService: LobbyRouterService) {
  }

  join() {
    this.lobbyRouterService.join(this.playerName, this.serverName);
  }

  start(serverName: string) {
    this.serverName = serverName;
    this.lobbyRouterService.toggleJoinGame();
  }

}
