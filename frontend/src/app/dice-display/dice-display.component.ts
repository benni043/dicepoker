import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RouterService} from "../router.service";
import {ChangeDiceObject, Dice} from "../game";

@Component({
  selector: 'app-dice-display',
  templateUrl: './dice-display.component.html',
  styleUrls: ['./dice-display.component.scss']
})
export class DiceDisplayComponent implements OnInit, OnChanges {

  constructor(public routerService: RouterService) {
  }

  @Input() dices: Dice[] = [];

  @Input() holdDices!: Dice[];

  displayDices: ChangeDiceObject[] = [{dice: Dice.one, change: false}, {dice: Dice.one, change: false}, {
    dice: Dice.one,
    change: false
  }, {dice: Dice.one, change: false}, {dice: Dice.one, change: false}];

  ngOnInit() {
    this.displayDices = []
    for (let dice of this.dices) {
      this.displayDices.push({dice: dice, change: false});
    }

    for (let holdDice of this.holdDices) {
      this.displayDices.push({dice: holdDice, change: true});
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.displayDices = [];

    for (let dice of this.dices) {
      console.log(dice)
      this.displayDices.push({dice: dice, change: true});
    }

    for (let holdDice of this.holdDices) {
      console.log(holdDice)
      this.displayDices.push({dice: holdDice, change: false});
    }
  }

  switch(index: number) {
    this.displayDices[index].change = !this.displayDices[index].change;
  }

  throw2() {
    this.routerService.throw(this.displayDices);

    this.displayDices = [];
  }

  canMove() {
    return this.routerService.activePlayer == this.routerService.playerName && !this.routerService.throwEnd && !this.routerService.end && !this.routerService.firstMove;
  }

  hold(index: number) {
    if (!this.canMove()) return;

    this.holdDices.push(this.dices[index]);
    this.dices.splice(index, 1);

    this.routerService.switched(this.dices, this.holdDices)
  }

  dehold(index: number) {
    if (!this.canMove()) return;

    this.dices.push(this.holdDices[index]);
    this.holdDices.splice(index, 1);

    this.routerService.switched(this.dices, this.holdDices)
  }

  throw() {
    const receiveDices: ChangeDiceObject[] = [];

    this.dices.forEach(dice => {
      const change = true
      receiveDices.push({dice, change});
    });

    this.holdDices.forEach(dice => {
      const change = false;
      receiveDices.push({dice, change});
    });

    this.holdDices = [];
    this.dices = []

    this.routerService.throw(receiveDices);
  }

  throwEnd() {
    this.routerService.leaveThrow();
  }
}
