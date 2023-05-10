import {Component} from '@angular/core';
import {RouterService} from "./router.service";
import {Dice} from "../../../backend/src/game";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';

  constructor(public routerService: RouterService) {
  }

  protected readonly Dice = Dice;
}
