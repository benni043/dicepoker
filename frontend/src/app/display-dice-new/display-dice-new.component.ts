import {Component, Input, OnInit} from '@angular/core';
import {RouterService} from "../router.service";
import {ChangeDiceObject, Dice} from "../utils/game";

@Component({
  selector: 'app-display-dice-new',
  templateUrl: './display-dice-new.component.html',
  styleUrls: ['./display-dice-new.component.scss']
})
export class DisplayDiceNewComponent{

  constructor(public routerService: RouterService) {

  }

  @Input() changeDices: ChangeDiceObject[] = [];

  switch(index: number) {
    if (this.canMove()) {
      this.changeDices[index].change = !this.changeDices[index].change;
      this.routerService.switchedDice(this.changeDices);
    }
  }

  throw() {
    this.routerService.throw(this.changeDices);
  }

  throwEnd() {
    this.routerService.leaveThrow();
  }

  canMove() {
    return this.routerService.activePlayer == this.routerService.playerName && !this.routerService.throwEnd && !this.routerService.end && !this.routerService.firstMove;
  }
}
