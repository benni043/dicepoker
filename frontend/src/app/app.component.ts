import {Component} from '@angular/core';
import {RouterService} from "./game/router.service";
import {LobbyRouterService} from "./lobby/lobby-router.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';


}
