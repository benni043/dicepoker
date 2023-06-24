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

  clicked: boolean = false;

  constructor(public routerService: RouterService) {
  }

  join() {
    this.routerService.join(this.playerName, this.serverName);
  }

  start(serverName: string) {
    this.serverName = serverName;
    this.clicked = true;
    console.log(this.clicked)
  }

  end() {
    this.clicked = false;
  }
}
