import { Component } from '@angular/core';
import {RouterService} from "../router.service";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent {

  constructor(private routerService: RouterService) {
  }

  serverName: number = 0;
  playerName: string = "";

  join() {
    this.routerService.join(this.playerName, this.serverName);
  }
}
