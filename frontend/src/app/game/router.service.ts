import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";
import {
    ChangeDiceObject,
    Dice,
    End,
    Game,
    NewDices,
    PointsField,
    RejoinData,
    RejoinType,
    StandardGameData,
    ThrowRes, UpdateDices
} from "../utils/game";
import {CookieService} from "ngx-cookie-service";

@Injectable({
    providedIn: 'root'
})
export class RouterService {

    errorMSG: string = "";

    socket!: Socket;
    movesLeft: number = 3;

    activePlayer: string = "";
    winner: string = "";

    playerName: string = "";
    serverName: string = "";

    booleans: boolean[] = [];

    sumField!: Map<string, PointsField> | null;
    playersField!: Map<string, PointsField> | null;

    joined: boolean = false;
    throwEnd: boolean = false;
    gameEnd: boolean = false;

    firstMove: boolean = true;

    dices: ChangeDiceObject[] = [];

    constructor(private cookieService: CookieService) {
        this.socket = connect(`${environment.apiURL}/dicepoker`);

        this.socket.on("gameNotStarted", () => {
            console.error("gameNotStarted");
        })
        this.socket.on("gameNotExists", () => {
            console.error("gameNotExists");
        })
        this.socket.on("wrongPlayer", () => {
            console.error("wrongPlayer")
        })
        this.socket.on("turnIsOver", () => {
            this.error("Du hast bereits 3 mal gewürfelt!");
        })
        this.socket.on("fieldFull", () => {
            this.error("Dieses Feld ist bereits belegt!")
        })
        this.socket.on("illegalPlayerArgs", () => {
            this.error("Es muss mindestens einen Spieler geben!")
        })


        this.socket.on("rejoin", (rejoinData: RejoinData) => {
            this.joined = true;

            switch (rejoinData.type) {
                case RejoinType.playerField: {
                    this.booleans = this.fillBooleans(new Map(JSON.parse(rejoinData.sumField!)), this.playerName);
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

            this.throwEnd = rejoinData.moves == 0;
            this.firstMove = rejoinData.moves == 3;
            this.dices = rejoinData.dices;
        })

        this.socket.on("joinSuccess", (sumField: { sumField: any }) => {
            this.sumField = new Map(JSON.parse(sumField.sumField))
            this.joined = true;

            this.socket.emit("getActivePlayer", {
                serverName: this.serverName,
                playerName: this.playerName
            } as StandardGameData)
        })

        this.socket.on("activePlayer", (activePlayer) => {
            this.activePlayer = activePlayer;
            this.throwEnd = false;
            this.firstMove = true;
            this.movesLeft = 3;

            this.dices = [
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true}];
        })

        this.socket.on("newDices", (res: ThrowRes) => {
            this.dices = res.newDices;

            this.movesLeft = res.moves;

            if (res.moves == 0) {
                this.throwEnd = true;

                this.socket.emit("getPlayersField", ({
                    playerName: this.playerName,
                    serverName: this.serverName
                } as StandardGameData));
            }
        })

        this.socket.on("playersField", (playersField: string) => {
            let map: Map<string, PointsField> = new Map(JSON.parse(playersField));

            if (!map.has(this.playerName)) return;

            map.get(this.playerName)!.sum! = this.sumField!.get(this.playerName)?.sum!;
            let name = map.entries().next().value[0];

            this.booleans = this.fillBooleans(this.sumField!, name)

            this.sumField = null;
            this.playersField = null;
            setTimeout(() => {
                this.playersField = map;
            }, 10)
        })

        this.socket.on("update", () => {
            this.socket.emit("getSumField", ({
                playerName: this.playerName,
                serverName: this.serverName
            } as StandardGameData))
        })

        this.socket.on("sumField", (sumField) => {
            let map: Map<string, PointsField> = new Map(JSON.parse(sumField));

            this.playersField = null;
            this.sumField = null;

            setTimeout(() => {
                this.sumField = map;

                if (!this.gameEnd) {
                    this.socket.emit("getActivePlayer", {
                        serverName: this.serverName,
                        playerName: this.playerName
                    } as StandardGameData)
                }
            }, 10)
        })

        this.socket.on("end", (end: End) => {
            this.gameEnd = true;
            this.sumField = new Map(JSON.parse(end.sumField));
            this.playersField = null;
            this.winner = end.winner;
            this.playerName = "";
            this.serverName = "";
            this.cookieService.deleteAll("/");
            this.dices = [
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true}];
        })

        this.socket.on("newChangedDices", (dices: ChangeDiceObject[]) => {
            this.dices = dices;
        });
    }

    joinGame() {
        this.socket.emit("joinToGame", {serverName: this.serverName, playerName: this.playerName});
    }

    error(msg: string) {
        this.errorMSG = "";

        setTimeout(() => {
            this.errorMSG = msg;
        }, 100)
    }

    fillBooleans(sumField: Map<string, PointsField>, name: string) {
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

    changedDices(dices: ChangeDiceObject[]) {
        this.socket.emit("sendNewDices", {
            dices: dices,
            standardGameData: {serverName: this.serverName, playerName: this.playerName}
        } as UpdateDices)
    }

    throw(receiveDices: ChangeDiceObject[]) {
        let dice = [
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true}];

        this.socket.emit("setDices", ({
            receiveDices: this.firstMove ? dice : receiveDices,
            standardGameData: {serverName: this.serverName, playerName: this.playerName},
        }))

        this.firstMove = false;
    }
}
