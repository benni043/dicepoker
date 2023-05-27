import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {environment} from "../environments/environment";
import {
  ChangeDiceObject,
  Dice, End,
  NewDices,
  PointsField,
  RejoinData,
  RejoinType,
  StandardGameData,
  ThrowRes
} from "./game";

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  errorMSG: string = "";

  error(msg: string) {
    this.errorMSG = "";

    setTimeout(() => {
      this.errorMSG = msg;
    }, 100)
  }

  constructor() {
    this.socket = connect(environment.apiURL);

    this.socket.on("gameFullErr", () => {
      this.error("Das Spiel ist voll!");
    })
    this.socket.on("gameNotStarted", () => {
      console.error("gameNotStarted");
    })
    this.socket.on("gameNotExists", () => {
      console.error("gameNotExists");
    })
    this.socket.on("gameFinished", () => {
      this.error("Das Spiel ist bereits beendet!");
    })
    this.socket.on("unknownPlayer", () => {
      this.error("Dieser Name ist bereits vergeben!")
    })
    this.socket.on("wrongPlayer", () => {
      console.error("wrongPlayer")
    })
    this.socket.on("illegalPlayerErr", () => {
      this.error("Dieser Name ist bereits vergeben!")
    })
    this.socket.on("turnIsOver", () => {
      this.error("Du hast bereits 3 mal gewürfelt!");
    })
    this.socket.on("fieldFull", () => {
      this.error("Dieses Feld ist bereits belegt!")
    })
    this.socket.on("gameNotExistsErr", () => {
      this.error("Dieser Server ist voll!");
    })
    this.socket.on("gameEnd", () => {
      this.error("Das Spiel ist bereits beendet!")
    })


    this.socket.on("joinSuccess", (sumField: { sumField: any }) => {
      console.log("joinSucc");

      this.sumField = new Map(JSON.parse(sumField.sumField))
      this.joined = true;

      this.socket.emit("getActivePlayer", {
        serverName: this.serverName,
        playerName: this.playerName
      } as StandardGameData)
    })
    this.socket.on("rejoin", (rejoinData: RejoinData) => {
      console.log("rejoin");

      this.joined = true;

      switch (rejoinData.type) {
        case RejoinType.playerField: {
          this.bools = this.fillBools(new Map(JSON.parse(rejoinData.sumField!)), this.playerName);
          this.playersField = new Map(JSON.parse(rejoinData.playerField!));
          this.activePlayer = rejoinData.actPlayer;
          break
        }
        case RejoinType.sumField: {
          this.sumField = new Map(JSON.parse(rejoinData.sumField!));
          this.activePlayer = rejoinData.actPlayer;
          break;
        }
        case RejoinType.dice: {
          this.sumField = new Map(JSON.parse(rejoinData.sumField!));
          this.activePlayer = rejoinData.actPlayer;
        }
      }

      this.movesLeft = rejoinData.moves;
      this.dices = rejoinData.dices;
      this.holdDices = rejoinData.holdDices;

      this.throwEnd = rejoinData.moves == 0;
      this.firstMove = rejoinData.moves == 3;
    })

    this.socket.on("newDices", (res: ThrowRes) => {
      this.dices = res.newDices.dices;
      this.holdDices = res.newDices.holdDices;
      this.movesLeft = res.moves;

      if (res.moves == 0) {
        this.throwEnd = true;

        this.socket.emit("getPlayersField", ({
          playerName: this.playerName,
          serverName: this.serverName
        } as StandardGameData));
      }
    })

    this.socket.on("setPlayersField", (playersField: string) => {
      let map: Map<string, PointsField> = new Map(JSON.parse(playersField));
      map.get(this.playerName)!.sum! = this.sumField!.get(this.playerName)?.sum!;
      let name = map.entries().next().value[0];

      this.bools = this.fillBools(this.sumField!, name)

      this.sumField = null;
      this.playersField = null;
      setTimeout(() => {
        this.playersField = map;
      }, 10)
    })

    this.socket.on("end", (end: End) => {
      this.end = true;
      this.sumField = new Map(JSON.parse(end.sumField));
      this.playersField = null;
      this.winner = end.winner;
    })

    this.socket.on("update", () => {
      this.socket.emit("getSumField", ({
        playerName: this.playerName,
        serverName: this.serverName
      } as StandardGameData))
    })

    this.socket.on("setSumField", (sumField) => {
      let map: Map<string, PointsField> = this.sortMap(new Map(JSON.parse(sumField)));

      this.playersField = null;
      this.sumField = null;
      this.dices = [];
      this.movesLeft = 3;

      setTimeout(() => {
        this.sumField = map;

        if (!this.end) {
          this.socket.emit("getActivePlayer", {
            serverName: this.serverName,
            playerName: this.playerName
          } as StandardGameData)
        }
      }, 10)
    })

    this.socket.on("setActivePlayer", (activePlayer) => {
      this.activePlayer = activePlayer;

      this.dices = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];
      this.holdDices = [];
      this.throwEnd = false;
      this.firstMove = true;
    })

    this.socket.on("switched", (newDices: NewDices) => {
      this.dices = newDices.dices;
      this.holdDices = newDices.holdDices;
    })
  }

  sortMap(map: Map<string, PointsField>): Map<string, PointsField> {
    const sortedArray = Array.from(map.entries()).sort(([key1], [key2]) => key1.localeCompare(key2));
    const sortedMap = new Map(sortedArray);
    return sortedMap
  }

  fillBools(sumField: Map<string, PointsField>, name: string) {
    let bools: boolean[] = []

    for (const [key, value] of Object.entries(sumField?.get(name)!)) {
      if (value == -1) {
        bools.push(true);
      } else {
        bools.push(false);
      }
    }

    return bools;
  }

  socket!: Socket;
  movesLeft: number = 3;

  activePlayer: string = "";
  winner: string = "";

  playerName: string = "";
  serverName: number = 0;

  bools: boolean[] = [];

  sumField!: Map<string, PointsField> | null;
  playersField!: Map<string, PointsField> | null;

  dices: Dice[] = [];
  holdDices: Dice[] = [];

  joined: boolean = false;
  throwEnd: boolean = false;
  end: boolean = false;

  firstMove: boolean = true;

  join(playerName: string, serverName: number) {
    this.playerName = playerName;
    this.serverName = serverName;

    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
  }

  sendValue(elem: string) {
    this.socket.emit("setField", {
      field: elem,
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    })
  }

  leaveThrow() {
    this.throwEnd = true;

    this.socket.emit("getPlayersField", ({
      playerName: this.playerName,
      serverName: this.serverName
    } as StandardGameData));
  }
  switched(dices: Dice[], holdDices: Dice[]) {
    this.socket.emit("switched", {
      newDices: {dices: dices, holdDices: holdDices},
      standardGameData: {serverName: this.serverName, playerName: this.playerName}
    })
  }

  throw(receiveDices: ChangeDiceObject[]) {
    let dices = [
      {dice: Dice.one, change: true},
      {dice: Dice.one, change: true},
      {dice: Dice.one, change: true},
      {dice: Dice.one, change: true},
      {dice: Dice.one, change: true}];

    this.dices = [];
    this.holdDices = [];

    for (let receiveDice of receiveDices) {
      if (receiveDice.change) {
        this.dices.push(receiveDice.dice);
      } else {
        this.holdDices.push(receiveDice.dice)
      }
    }

    this.socket.emit("setDices", ({
      receiveDices: this.firstMove ? dices : receiveDices,
      standardGameData: {serverName: this.serverName, playerName: this.playerName},
    }))

    this.firstMove = false;
  }

}
