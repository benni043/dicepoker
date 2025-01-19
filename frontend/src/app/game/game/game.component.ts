import { Component } from '@angular/core';
import {RouterService} from "../../router.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  constructor(public routerService: RouterService, private router: Router) {
  }

  leaveGame() {
    this.router.navigate(['/']).then();
  }

}
