import {Component, Input} from '@angular/core';
import {RouterService} from "../router.service";
import {PointsField} from "../../../../backend/src/game";

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent {

  constructor(private routerService: RouterService) {
    // this.map = new Map();
    //
    // this.map.set("test", {
    //   doubleGrande: 0,
    //   fives: 0,
    //   fours: 0,
    //   fullHouse: 0,
    //   grande: 0,
    //   ones: 0,
    //   poker: 0,
    //   sixes: 0,
    //   street: 0,
    //   sum: 0,
    //   threes: 0,
    //   twos: 0
    // })
    //
    // this.map.set("test2", {
    //   doubleGrande: 0,
    //   fives: 0,
    //   fours: 0,
    //   fullHouse: 0,
    //   grande: 0,
    //   ones: 0,
    //   poker: 0,
    //   sixes: 0,
    //   street: 0,
    //   sum: 0,
    //   threes: 0,
    //   twos: 123
    // })
  }

  @Input() map!: Map<string, PointsField>;

  @Input() readonlyV: boolean = true;
  @Input() playersField: boolean = false;

  @Input() bools: boolean[] = [];

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

  getSums() {
    let sums = []

    for (let key of this.map.keys()) {
      sums.push(this.map.get(key)!.sum);
    }

    return sums;
  }

  getNames(): string[] {
    let list = ["DicePoker"];

    for (let key of this.map.keys()) {
      list.push(key);
    }

    return list;
  }

  click(i: number): void {
    if (!this.readonlyV) {
      this.routerService.sendValue(this.list[i]);
    }
  }
}
