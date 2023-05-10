import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {Dice, ReceiveDice, SetPointsField} from "../../../backend/src/game";


@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
    this.socket = connect("http://localhost:3000/");

    this.socket.on("joinSuccess", (dices: Dice[]) => {
      console.log("joinSucc")
      for (let dice of dices) {
        this.dices.push(dice);
      }
      console.log(this.dices)
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
      this.dices = newDices
      console.log(this.dices)
    })

    this.socket.on("throwSuccessEnd", (throwReturn) => {
      let map: Map<string, SetPointsField> = new Map(JSON.parse(throwReturn.sumField));

      this.sumField = null;
      setTimeout(() => {
        this.sumField = map;
        this.dices = [];
      }, 10);
    })

    this.socket.on("setSuccess", (sumField) => {
      let map: Map<string, SetPointsField> = new Map(JSON.parse(sumField));

      this.sumField = null;
      setTimeout(() => {
        this.sumField = map;
      }, 10)
    })

    this.socket.on("turnIsNotOver", () => {
      alert("Du hat noch nicht 3 mal gewürfelt!");
    })

    this.socket.on("turnIsOver", () => {
      alert("Du hast bereits 3 mal gewürfelt!")
    })
  }

  socket!: Socket;

  playerName: string = "";
  serverName: number = 0;

  sumField!: Map<string, SetPointsField> | null;

  dices: Dice[] = [];

  join(playerName: string, serverName: number) {
    this.playerName = playerName;
    this.serverName = serverName;

    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
  }

  sendValue(elem: string) {
    this.socket.emit("setPoint", {
      field: elem,
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    })
  }

  throw(receiveDices: ReceiveDice[]) {
    this.socket.emit("throw", ({
      receiveDices: receiveDices,
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    }))
  }

}
