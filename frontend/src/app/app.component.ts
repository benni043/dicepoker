import {Component} from '@angular/core';
import {RouterService} from "./router.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';

  constructor(public routerService: RouterService) {
  }

  newGame: boolean = false;

  back() {

  }
}
