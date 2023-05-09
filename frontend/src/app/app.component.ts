import {Component} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {Dice, SetPointData, StandardGameData, ThrowData, ThrowReturn} from "../../../utils/game";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend';

  socket: Socket;

  playerName: string = "";
  serverName: number = 0;

  dices: Dice[] = [];

  constructor() {
    this.socket = connect("http://localhost:3000/");

    this.socket.on("joinSuccess", (dices: Dice[]) => {
      console.log("joinSucc")
      for (let dice of dices) {
        this.dices.push(dice);
      }

      console.log(dices);
    })

    this.socket.on("gameFullErr", () => {
      console.log("gameIsFull");
    })

    this.socket.on("gameNotStartedErr", () => {
      console.log("gameNotStartedErr");
    })

    this.socket.on("illegalPlayerErr", () => {
      console.log("illegalPlayerErr");
    })

    this.socket.on("playerNotOnTurnErr", () => {
      alert("Du bist nicht an der Reihe!");
    })

    this.socket.on("throwSuccess", (newDices: Dice[]) => {
      console.log(newDices);
    })

    this.socket.on("throwSuccessEnd", (throwReturn: ThrowReturn) => {
      console.log(throwReturn.response);
      console.log("pointsField: ")
      console.log(throwReturn.pointsField);
    })

    this.socket.on("setSuccess", (points: number) => {
      console.log("points: ")
      console.log(points)
    })

    this.socket.on("turnIsNotOver", () => {
      alert("Du hat noch nicht 3 mal gewürfelt!");
    })
  }


  throw() {
    this.socket.emit("throw", ({
      receiveDices: [
        {dice: this.dices[0], change: false},
        {dice: this.dices[1], change: true},
        {dice: this.dices[2], change: false},
        {dice: this.dices[3], change: true},
        {dice: this.dices[4], change: true}
      ],
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    } as ThrowData))
  }

  setPoint() {
    this.socket.emit("setPoint", ({standardGameData: {serverName: this.serverName, playerName: this.playerName}, field: "fours"} as SetPointData))
  }

}
