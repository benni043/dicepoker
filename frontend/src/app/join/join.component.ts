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
    console.log(this.playerName)
    console.log(this.serverName)
    this.routerService.join(this.playerName, this.serverName);
  }

  makeList() {
    return Array.from(this.routerService.game.keys());
  }

}
