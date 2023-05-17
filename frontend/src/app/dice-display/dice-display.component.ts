import {Component, Input} from '@angular/core';
import {ChangeDiceObject, Dice} from "../../../../backend/src/game";
import {RouterService} from "../router.service";

@Component({
  selector: 'app-dice-display',
  templateUrl: './dice-display.component.html',
  styleUrls: ['./dice-display.component.scss']
})
export class DiceDisplayComponent {

  constructor(public routerService: RouterService) {
  }

  @Input() dices!: Dice[];

  @Input() holdDices!: Dice[];

  canMove() {
    return this.routerService.activePlayer == this.routerService.playerName && !this.routerService.throwEnd && !this.routerService.end && !this.routerService.firstMove;
  }

  hold(index: number) {
    if (!this.canMove()) return;

    this.holdDices.push(this.dices[index]);
    this.dices.splice(index, 1);
  }

  dehold(index: number) {
    if (!this.canMove()) return;

    this.dices.push(this.holdDices[index]);
    this.holdDices.splice(index, 1);
  }

  throw() {
    const receiveDices: ChangeDiceObject[] = [];

    this.dices.forEach(dice => {
      const change = true
      receiveDices.push({ dice, change });
    });

    this.holdDices.forEach(dice => {
      const change = false;
      receiveDices.push({ dice, change });
    });

    this.holdDices = [];
    this.dices = []

    this.routerService.throw(receiveDices);
  }
}
