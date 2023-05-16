import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {ChangeDiceObject, Dice, Player, PointsField, StandardGameData} from "../../../backend/src/game";


@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
    this.socket = connect("http://localhost:3000/");

    this.socket.on("joinSuccess", (players: { p1: string, p2: string, sumField: any}) => {
      console.log("joinSucc");

      this.opponent = players.p1 == this.playerName ? players.p2 : players.p1;

      if (this.opponent != "") {
        this.sumField = new Map(JSON.parse(players.sumField))
      }

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

    this.socket.on("fieldAlreadySetErr", () => {
      console.log("Dieses Feld ist bereits belegt!");
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
      let name = map.entries().next().value[0];

      this.bools = [];

      for (const [key, value] of Object.entries(this.sumField?.get(name)!)) {
        if (value == -1) {
          this.bools.push(true);
        } else {
          this.bools.push(false);
        }
      }

      this.sumField = null;
      this.playersField = null;
      setTimeout(() => {
        this.playersField = map;
      }, 10)
    })

    this.socket.on("setSuccess", () => {
      this.socket.emit("getSumField", ({playerName: this.playerName, serverName: this.serverName} as StandardGameData))
    })

    this.socket.on("end", () => {
      this.end = true;
      this.activePlayer = "";

      //machen

      let p1Sum = this.sumField?.get(this.playerName)!.sum!;
      let p2Sum = this.sumField?.get(this.opponent)!.sum!;

      console.log(p1Sum)
      console.log(p2Sum)

      this.winner = p1Sum > p2Sum ? this.playerName : this.opponent;
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
    })
  }

  sortMap(map: Map<string, PointsField>): Map<string, PointsField> {
    const sortedArray = Array.from(map.entries()).sort(([key1], [key2]) => key1.localeCompare(key2));
    const sortedMap = new Map(sortedArray);
    return sortedMap
  }

  socket!: Socket;

  activePlayer: string = "";
  opponent: string = "";
  winner: string = "";

  playerName: string = "";
  serverName: number = 0;

  bools: boolean[] = [];

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
