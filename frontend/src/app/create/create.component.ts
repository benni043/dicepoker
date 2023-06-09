import { Component } from '@angular/core';
import {RouterService} from "../router.service";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  serverName: string = "";
  playerCount: number = 0;
  columnCount: number = 0;

  constructor(public routerService: RouterService) {
  }

  createServer() {
    this.routerService.create(this.serverName, this.playerCount)
  }

}
