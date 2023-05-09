import {Component} from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent {

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
  }> = new Map();

  constructor() {
    this.map.set("benni043", {
      ones: 123,
      twos: 2,
      threes: 4,
      fours: 0,
      fives: 0,
      sixes: 43,
      fullHouse: 34,
      street: 34,
      poker: 34,
      grande: 34,
      doubleGrande: 3
    });

    this.map.set("tobnion", {
      ones: 123,
      twos: 2,
      threes: 4,
      fours: 3,
      fives: 24,
      sixes: 43,
      fullHouse: 34,
      street: 34,
      poker: 34,
      grande: 34,
      doubleGrande: 3
    });

    this.map.set("götzesdfgsdfg", {
      ones: 123,
      twos: 2,
      threes: 4,
      fours: 3,
      fives: 24,
      sixes: 43,
      fullHouse: 34,
      street: 34,
      poker: 34,
      grande: 34,
      doubleGrande: 3
    });
  }

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

  click(i: number): string {
    console.log(this.list[i])
    return this.list[i];
  }
}
