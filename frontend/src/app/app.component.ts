import {Component} from '@angular/core';
import {RouterService} from "./router.service";
import {LobbyRouterService} from "./lobby-router.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';

  constructor(public routerService: RouterService, public lobbyRouterService: LobbyRouterService) {
  }

  newGame: boolean = false;

  back() {
    window.location.reload()
  }
}
