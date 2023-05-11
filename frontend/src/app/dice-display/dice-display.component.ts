import {Component, Input} from '@angular/core';
import {Dice, ChangeDiceObject} from "../../../../backend/src/game";
import {RouterService} from "../router.service";

@Component({
  selector: 'app-dice-display',
  templateUrl: './dice-display.component.html',
  styleUrls: ['./dice-display.component.scss']
})
export class DiceDisplayComponent {

  constructor(private routerService: RouterService) {
  }

  @Input() dices!: Dice[];

  holdDices: Dice[] = [];

  hold(index: number) {
    this.holdDices.push(this.dices[index]);
    this.dices.splice(index, 1);
  }

  dehold(index: number) {
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
