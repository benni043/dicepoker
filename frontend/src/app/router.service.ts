import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {ChangeDiceObject, Dice, PointsField, StandardGameData, Throw} from "../../../backend/src/game";


@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
    this.socket = connect("http://localhost:3000/");

    this.socket.on("joinSuccess", () => {
      console.log("joinSucc")
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
      console.log("Du bist nicht an der Reihe!");
    })

    this.socket.on("turnIsNotOver", () => {
      console.log("Du hat noch nicht 3 mal gewürfelt!");
    })

    this.socket.on("turnIsOver", () => {
      console.log("Du hast bereits 3 mal gewürfelt!")
    })


    this.socket.on("throwSuccess", (res: Throw) => {
      this.dices = res.dices;

      if (res.end) {
        this.socket.emit("getPlayersField", ({
          playerName: this.playerName,
          serverName: this.serverName
        } as StandardGameData))
      }
    })

    this.socket.on("setPlayersField", (playersField) => {
      let map: Map<string, PointsField> = new Map(JSON.parse(playersField));

      this.sumField = null;
      this.playersField = null;
      setTimeout(() => {
        this.playersField = map;
      }, 10)
    })

    this.socket.on("setSuccess", () => {
      this.socket.emit("getSumField", ({playerName: this.playerName, serverName: this.serverName} as StandardGameData))
    })

    this.socket.on("setSumField", (sumField) => {
      let map: Map<string, PointsField> = new Map(JSON.parse(sumField));

      this.playersField = null;
      this.sumField = null;
      this.dices = [];

      setTimeout(() => {
        this.sumField = map;
        this.socket.emit("turnChange", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
      }, 10)
    })

    this.socket.on("yourTurn", (activePlayer) => {
      this.dices = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];

      this.activePlayer = activePlayer;
      console.log(activePlayer)
    })
  }

  socket!: Socket;

  activePlayer: string = "";

  playerName: string = "";
  serverName: number = 0;

  sumField!: Map<string, PointsField> | null;
  playersField!: Map<string, PointsField> | null;

  dices: Dice[] = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];

  join(playerName: string, serverName: number) {
    this.playerName = playerName;
    this.serverName = serverName;

    this.socket.emit("turnChange", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
  }

  sendValue(elem: string) {
    this.socket.emit("setField", {
      field: elem,
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    })
  }

  throw(receiveDices: ChangeDiceObject[]) {
    this.socket.emit("throw", ({
      receiveDices: receiveDices,
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    }))
  }

}
