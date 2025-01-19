import {Component, OnInit} from '@angular/core';
import {LobbyRouterService} from "../lobby-router.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  constructor(public lobbyRouterService: LobbyRouterService, private router: Router) {
  }

  ngOnInit(): void {
    if (this.lobbyRouterService.socket == null) {
      this.lobbyRouterService.connect();
    }
  }

  createGame() {
    this.router.navigate(['/create_game']).then();
  }

  joinGame(gameID: string) {
    this.router.navigate(['/join_game', gameID]).then();
  }

}
