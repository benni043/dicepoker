import {Component} from '@angular/core';
import {connect} from "socket.io-client";
import {Dice, SetPointsField, ThrowData} from "../../../backend/src/game";
import {RouterService} from "./router.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';

  dices: Dice[] = [];

  constructor(public routerService: RouterService) {
    routerService.socket = connect("http://localhost:3000/");

    routerService.socket.on("joinSuccess", (dices: Dice[]) => {
      console.log("joinSucc")
      for (let dice of dices) {
        this.dices.push(dice);
      }

      console.log(dices);
    })

    routerService.socket.on("gameFullErr", () => {
      console.log("gameIsFull");
    })

    routerService.socket.on("gameNotStartedErr", () => {
      console.log("gameNotStartedErr");
    })

    routerService.socket.on("illegalPlayerErr", () => {
      console.log("illegalPlayerErr");
    })

    routerService.socket.on("playerNotOnTurnErr", () => {
      alert("Du bist nicht an der Reihe!");
    })

    routerService.socket.on("throwSuccess", (newDices: Dice[]) => {
      console.log(newDices);
    })

    routerService.socket.on("throwSuccessEnd", (throwReturn) => {
      let map: Map<string, SetPointsField> = new Map(JSON.parse(throwReturn.sumField));

      console.log(throwReturn.dices);

      this.routerService.sumField = null;
      setTimeout(() => {
        this.routerService.sumField = map;
      }, 10)
    })

    routerService.socket.on("setSuccess", (sumField) => {
      let map: Map<string, SetPointsField> = new Map(JSON.parse(sumField));

      this.routerService.sumField = null;
      setTimeout(() => {
        this.routerService.sumField = map;
      }, 10)
    })

    routerService.socket.on("turnIsNotOver", () => {
      alert("Du hat noch nicht 3 mal gewürfelt!");
    })

    routerService.socket.on("turnIsOver", () => {
      alert("Du hast bereits 3 mal gewürfelt!")
    })
  }

  throw() {
    this.routerService.socket.emit("throw", ({
      receiveDices: [
        {dice: this.dices[0], change: false},
        {dice: this.dices[1], change: true},
        {dice: this.dices[2], change: false},
        {dice: this.dices[3], change: true},
        {dice: this.dices[4], change: true}
      ],
      standardGameData: {serverName: this.routerService.serverName, playerName: this.routerService.playerName}
    } as ThrowData))
  }

  // setPoint() {
  //   this.routerService.socket.emit("setPoint", ({
  //     standardGameData: {
  //       serverName: this.routerService.serverName,
  //       playerName: this.routerService.playerName
  //     }, field: "fours"
  //   } as SetPointData))
  // }

}
