import {Component, Input, OnInit} from '@angular/core';
import {RouterService} from "../router.service";
import {PointsField} from "../../utils/game";

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent{

  constructor(private routerService: RouterService) {
    // this.map = new Map();
    //
    // this.map.set("test", {
    //   doubleGrande: 100,
    //   fives: 0,
    //   fours: 3,
    //   fullHouse: 0,
    //   grande: 0,
    //   ones: 100,
    //   poker: 0,
    //   sixes: 0,
    //   street: 0,
    //   sum: 0,
    //   threes: 0,
    //   twos: 100
    // })
    //
    // this.map.set("test2", {
    //   doubleGrande: 0,
    //   fives: 0,
    //   fours: 0,
    //   fullHouse: 0,
    //   grande: 0,
    //   ones: 1,
    //   poker: 0,
    //   sixes: 0,
    //   street: 0,
    //   sum: 0,
    //   threes: 0,
    //   twos: 123
    // })
    //
    // this.map.set("test3", {
    //   doubleGrande: 0,
    //   fives: 0,
    //   fours: 0,
    //   fullHouse: 0,
    //   grande: 0,
    //   ones: 1,
    //   poker: 0,
    //   sixes: 0,
    //   street: 0,
    //   sum: 0,
    //   threes: 0,
    //   twos: 123
    // })
    //
    // this.map.set("test4", {
    //   doubleGrande: 0,
    //   fives: 0,
    //   fours: 0,
    //   fullHouse: 0,
    //   grande: 0,
    //   ones: 1,
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
  @Input() bools: boolean[] = [];

  list: string[] = ["ones","twos", "threes", "fours", "fives", "sixes", "fullHouse", "street", "poker", "grande", "doubleGrande"];
  nameCol: string[] = ["Poker", "1", "2", "3", "4", "5", "6", "F", "St", "P", "G", "Dg", "Summe"];

  getPlayers() {
    let players: string[] = [];

    for (const obj of this.map.keys()) {
      players.push(obj);
    }

    return players
  }

  getValuesOfPlayer(player: string) {
    let values: number[] = [];

    values.push(this.map.get(player)?.ones!);
    values.push(this.map.get(player)?.twos!);
    values.push(this.map.get(player)?.threes!);
    values.push(this.map.get(player)?.fours!);
    values.push(this.map.get(player)?.fives!);
    values.push(this.map.get(player)?.sixes!);
    values.push(this.map.get(player)?.fullHouse!);
    values.push(this.map.get(player)?.street!);
    values.push(this.map.get(player)?.poker!);
    values.push(this.map.get(player)?.grande!);
    values.push(this.map.get(player)?.doubleGrande!);

    return values;
  }

  getSumOfPlayer(player: string) {
    return this.map.get(player)?.sum!;
  }

  click(i: number): void {
    if (!this.readonlyV) {
      if (this.bools[i]) {
        this.routerService.sendValue(this.list[i]);
      }
    }
  }

}
