import { Component } from '@angular/core';
import {LobbyRouterService} from "../../lobby-router.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent {

  playerName: string = "";
  gameId: string = "";

  constructor(public lobbyRouterService: LobbyRouterService, private router: Router, private route: ActivatedRoute) {
    this.gameId = this.route.snapshot.paramMap.get('id')!;
  }

  join() {
    this.lobbyRouterService.join(this.playerName, this.gameId);
  }

  cancel() {
    this.router.navigate(['/']).then();
  }

}
