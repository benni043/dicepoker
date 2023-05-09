import {Component} from '@angular/core';
import {RouterService} from "../router.service";

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent {

  constructor(private routerService: RouterService) {
  }

  map: Map<string, {
    ones: number,
    twos: number,
    threes: number,
    fours: number,
    fives: number,
    sixes: number,
    fullHouse: number,
    street: number,
    poker: number,
    grande: number,
    doubleGrande: number
  }> = this.routerService.sumField!;

  list: string[] = ["ones", "twos", "threes", "fours", "fives", "sixes", "fullHouse", "street", "poker", "grande", "doubleGrande"];

  getRowElements(index: number): number[] {
    const values: number[] = [];
    for (const obj of this.map.values()) {
      const objValues = Object.values(obj);
      const value = objValues[index];
      if (Number.isInteger(value)) {
        values.push(value);
      }
    }
    return values;
  }

  getNames(): string[] {
    let list = ["DicePoker"];

    for (let key of this.map.keys()) {
      list.push(key);
    }

    return list;
  }

  click(i: number): void {
    this.routerService.sendValue(this.list[i]);
  }
}
