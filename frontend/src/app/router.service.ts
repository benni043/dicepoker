import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {ChangeDiceObject, Dice, PointsField, RejoinData, RejoinType, StandardGameData} from "../../../backend/src/game";
import {environment} from "../environment/environment";


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
    this.socket = connect(environment.baseAddress);

    this.socket.on("gameFullErr", () => {
      console.log("Das Spiel ist voll!");
      this.error("Das Spiel ist voll!");
    })
    this.socket.on("gameNotStartedErr", () => {
      console.log("gameNotStartedErr");
    })
    this.socket.on("illegalPlayerErr", () => {
      console.log("illegalPlayerErr");
      this.error("Dieser Name ist bereits vergeben!")
    })
    this.socket.on("playerNotOnTurnErr", () => {
      console.log("Du bist nicht an der Reihe!");
      this.error("Du bist nicht an der Reihe!");
    })
    this.socket.on("turnIsNotOver", () => {
      console.log("Du hat noch nicht 3 mal gewürfelt!");
      this.error("Du hat noch nicht 3 mal gewürfelt!");
    })
    this.socket.on("turnIsOver", () => {
      console.log("Du hast bereits 3 mal gewürfelt!")
      this.error("Du hast bereits 3 mal gewürfelt!");
    })
    this.socket.on("fieldAlreadySetErr", () => {
      console.log("Dieses Feld ist bereits belegt!");
      console.log("Dieses Feld ist bereits belegt!")
    })
    this.socket.on("gameNotExistsErr", () => {
      console.log("Dieser Server ist voll!")
      this.error("Dieser Server ist voll!");
    })


    this.socket.on("joinSuccess", (sumField: { sumField: any}) => {
      console.log("joinSucc");

      this.sumField = new Map(JSON.parse(sumField.sumField))

      this.joined = true;

      this.socket.emit("turnChange", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
    })
    this.socket.on("rejoin", (rejoinData: RejoinData) => {
      console.log("rejoin");

      this.joined = true;

      switch (rejoinData.type) {
        case RejoinType.playerField: {
          this.bools = this.fillBools(new Map(JSON.parse(rejoinData.sumField!)), this.playerName);
          this.playersField = new Map(JSON.parse(rejoinData.playerField!));
          this.activePlayer = this.playerName;
          break
        }
        case RejoinType.sumField: {
          this.sumField = new Map(JSON.parse(rejoinData.sumField));
          this.activePlayer = "opponent";
          break;
        }
        case RejoinType.dice: {
          this.sumField = new Map(JSON.parse(rejoinData.sumField));
          this.activePlayer = this.playerName;
        }
      }

      if (rejoinData.dices.length == 0) {
        this.dices = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];
      } else {
        this.dices = rejoinData.dices
      }

      this.activePlayer = rejoinData.actPlayer
      this.throwEnd = rejoinData.moves == 0;
      this.firstMove = rejoinData.moves == 3;
    })


    this.socket.on("throwSuccess", (res: Dice[]) => {
      this.dices = this.subtractArray(res, this.holdDices);
      this.movesLeft--;
    })
    this.socket.on("moves0", () => {
      this.throwEnd = true;

      let sum = [];
      for (let dice of this.dices) {
        sum.push(dice)
      }
      for (let holdDice of this.holdDices) {
        sum.push(holdDice)
      }

      this.holdDices = [];
      this.dices = sum;

      this.socket.emit("getPlayersField", ({
        playerName: this.playerName,
        serverName: this.serverName
      } as StandardGameData))
    })
    this.socket.on("setPlayersField", (playersField) => {
      let map: Map<string, PointsField> = new Map(JSON.parse(playersField));
      let name = map.entries().next().value[0];

      this.bools = this.fillBools(this.sumField!, name)

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
      let map: Map<string, PointsField> = this.sortMap(new Map(JSON.parse(sumField)));

      this.playersField = null;
      this.sumField = null;
      this.dices = [];

      setTimeout(() => {
        this.sumField = map;

        if (!this.end) {
          this.socket.emit("turnChange", {serverName: this.serverName, playerName: this.playerName} as StandardGameData)
        }
      }, 10)
    })
    this.socket.on("playerTurnInformation", (activePlayer) => {
      this.activePlayer = activePlayer;
      this.movesLeft = 3;

      this.dices = [Dice.one, Dice.one, Dice.one, Dice.one, Dice.one];
      this.holdDices = [];
      this.throwEnd = false;
      this.firstMove = true;
    })

    this.socket.on("end", (playersAndSums: {playerName: string, points: number}[]) => {
      this.end = true;
      this.activePlayer = "";

      let biggestSum: number = playersAndSums[0].points;
      let winner = playersAndSums[0].playerName;

      for (let playersAndSum of playersAndSums) {
        if (playersAndSum.points > biggestSum) {
          biggestSum = playersAndSum.points;
          winner = playersAndSum.playerName;
        }
      }

      this.winner = winner;
    })
  }

  subtractArray(array1: number[], array2: number[]): number[] {
    const countMap = new Map<number, number>();

    for (const num of array1) {
      countMap.set(num, (countMap.get(num) || 0) + 1);
    }

    for (const num of array2) {
      if (countMap.has(num)) {
        const count = countMap.get(num)!;
        if (count > 1) {
          countMap.set(num, count - 1);
        } else {
          countMap.delete(num);
        }
      }
    }

    const result: number[] = [];
    for (const [num, count] of countMap) {
      for (let i = 0; i < count; i++) {
        result.push(num);
      }
    }

    return result;
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

  throw(receiveDices: ChangeDiceObject[]) {
    let dices : ChangeDiceObject[] = [];
    dices.push({dice: Dice.one, change: true});
    dices.push({dice: Dice.one, change: true});
    dices.push({dice: Dice.one, change: true});
    dices.push({dice: Dice.one, change: true});
    dices.push({dice: Dice.one, change: true});

    this.dices = [];
    this.holdDices = [];
    for (let receiveDice of receiveDices) {
      if (receiveDice.change) {
        this.dices.push(receiveDice.dice);
      } else {
        this.holdDices.push(receiveDice.dice)
      }
    }

    this.socket.emit("throw", ({
      receiveDices: this.firstMove ? dices : receiveDices,
      standardGameData: {serverName: this.serverName, playerName: this.playerName},
    }))

    this.firstMove = false;
  }

}
