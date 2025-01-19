import { Component } from '@angular/core';
import {LobbyRouterService} from "../../lobby-router.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  serverName: string = "";
  playerCount: number = 0;
  columnCount: number = 0;

  constructor(public lobbyRouterService: LobbyRouterService, private router: Router) {
  }

  createServer() {
    this.lobbyRouterService.create(this.serverName, this.playerCount);
    this.back();
  }

  back() {
    this.router.navigate(['/']).then();
  }

}
