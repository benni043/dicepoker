import {Component} from '@angular/core';
import {RouterService} from "../router.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  constructor(public routerService: RouterService, private router: Router, private route: ActivatedRoute) {
    this.routerService.serverName = this.route.snapshot.paramMap.get('id')!;
    this.routerService.playerName = this.route.snapshot.queryParamMap.get('playerName')!;

    this.routerService.joinGame();
  }

  leaveGame() {
    this.routerService.socket.disconnect();
    this.router.navigate(['/']).then();
  }

}
