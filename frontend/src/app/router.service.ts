import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {ChangeDiceObject, Dice, PointsField, ReturnEnum, StandardGameData} from "../../../backend/src/game";


@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
    this.socket = connect("http://localhost:3000/");

    this.socket.on("joinSuccess", () => {
      console.log("joinSucc")
      this.joined = true;
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

    this.socket.on("throwSuccess", (res: Dice[]) => {
      this.dices = res;
    })

    this.socket.on("moves0", () => {
      this.throwEnd = true;

      this.socket.emit("getPlayersField", ({
        playerName: this.playerName,
        serverName: this.serverName
      } as StandardGameData))
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

    this.socket.on("end", (res: ReturnEnum) => {
      this.end = true;
      console.log(res.toString())
    })

    this.socket.on("setSumField", (sumField) => {
      let map: Map<string, PointsField> = this.sortMap(new Map(JSON.parse(sumField)));

      this.playersField = null;
      this.sumField = null;
      this.dices = [];

      setTimeout(() => {
        this.sumField = map;
        this.socket.emit("turnChange", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
      }, 10)
    })

    this.socket.on("playerTurnInformation", (activePlayer) => {
      this.dices = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];
      this.holdDices = [];
      this.activePlayer = activePlayer;
      this.throwEnd = false;

      this.socket.emit("end", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
    })

    this.socket.on("fieldAlreadySetErr", () => {
      console.log("Dieses Feld ist bereits belegt!");
    })
  }

  sortMap(map: Map<string, PointsField>): Map<string, PointsField> {
    const sortedArray = Array.from(map.entries()).sort(([key1], [key2]) => key1.localeCompare(key2));
    const sortedMap = new Map(sortedArray);
    return sortedMap
  }

  socket!: Socket;

  activePlayer: string = "";

  playerName: string = "";
  serverName: number = 0;

  sumField!: Map<string, PointsField> | null;
  playersField!: Map<string, PointsField> | null;

  dices: Dice[] = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];
  holdDices: Dice[] = [];

  joined: boolean = false;

  throwEnd: boolean = false;

  end: boolean = false;

  join(playerName: string, serverName: number) {
    this.playerName = playerName;
    this.serverName = serverName;

    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
    this.socket.emit("turnChange", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
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
