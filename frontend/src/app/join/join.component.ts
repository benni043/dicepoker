import { Component } from '@angular/core';
import {RouterService} from "../router.service";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent {

  playerName: string = "";
  serverName: string = "";

  constructor(public routerService: RouterService) {
  }

  join() {
    this.routerService.join(this.playerName, this.serverName);
  }

  start(serverName: string) {
    this.serverName = serverName;
    this.routerService.toggleJoinGame();
  }

}
