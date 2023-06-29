import {Component, Input} from '@angular/core';
import {RouterService} from "../router.service";
import {ChangeDiceObject, Dice} from "../game";

@Component({
  selector: 'app-display-dice-new',
  templateUrl: './display-dice-new.component.html',
  styleUrls: ['./display-dice-new.component.scss']
})
export class DisplayDiceNewComponent {

  constructor(public routerService: RouterService) {

  }

  @Input() changeDices: ChangeDiceObject[] = [];

  switch(index: number) {
    this.changeDices[index].change = !this.changeDices[index].change;
  }

  throw() {
    this.routerService.throw(this.changeDices);
  }

  throwEnd() {
    this.routerService.leaveThrow();
  }
}
