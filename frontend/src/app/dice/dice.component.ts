import {Component, Input, OnInit} from '@angular/core';
import {Dice} from "../game";

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent implements OnInit{

  @Input() dice!: Dice;

  path: string = "/assets/src/";

  ngOnInit(): void {
    switch (this.dice) {
      case Dice.one: {
        this.path += "eins.png";
        break;
      }
      case Dice.two: {
        this.path += "zwei.png";
        break;
      }
      case Dice.three: {
        this.path += "drei.png";
        break;
      }
      case Dice.four: {
        this.path += "vier.png";
        break;
      }
      case Dice.five: {
        this.path += "fuenf.png";
        break;
      }
      case Dice.six: {
        this.path += "sechs.png";
      }
    }
  }

}
