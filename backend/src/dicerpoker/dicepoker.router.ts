import express, {Router} from "express";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {
    Change,
    End,
    GetError,
    Player,
    PointsField,
    SetError,
    SetPointData,
    SetSuccess,
    StandardGameData,
    ThrowData,
    UpdateDices
} from "../game";

export class DicepokerRouter {

    router = Router();
    dicepokerService: DicepokerService = new DicepokerService();

    constructor(app: express.Application, socketIO: Server) {
        app.use("/dicepoker", this.router)

        socketIO.of('/dicepoker').on("connection", (ws) => {
            let playerName: string
            let serverName: string

            console.log(`${ws} connected to game`);

            ws.on("sendNewDices", (data: UpdateDices) => {
                let players: Player[] = this.dicepokerService.getPlayers(data.standardGameData.serverName);
                let res = this.dicepokerService.changeDices(data.standardGameData.serverName, data.standardGameData.playerName, data.dices);

                if (res == Change.illegalArgs) {
                    ws.emit("illegalDiceArgs");
                } else {
                    for (let player of players) {
                        player.socket?.emit("newChangedDices", (data.dices))
                    }
                }
            }) //finish

            ws.on("setDices", (throwData: ThrowData) => {
                let res = this.dicepokerService.routerSetDices(throwData.receiveDices, throwData.standardGameData.playerName, throwData.standardGameData.serverName);
                let players: Player[] = this.dicepokerService.getPlayers(throwData.standardGameData.serverName);

                if (res === SetError.gameNotStarted) {
                    ws.emit("gameNotStarted");
                } else if (res === SetError.gameNotExists) {
                    ws.emit("gameNotExists");
                } else if (res === SetError.gameFinished) {
                    ws.emit("gameFinished");
                } else if (res === SetError.unknownPlayer) {
                    ws.emit("unknownPlayer")
                } else if (res === SetError.wrongPlayer) {
                    ws.emit("wrongPlayer");
                } else {
                    for (let player of players) {
                        player.socket?.emit("newDices", res)
                    }
                }
            }); //finish

            ws.on("getPlayersField", (standardGameData: StandardGameData) => {
                let res: Map<string, PointsField> | SetError = this.dicepokerService.routerGetPlayersField(standardGameData.playerName, standardGameData.serverName);

                if (res === SetError.gameNotStarted) {
                    ws.emit("gameNotStarted");
                } else if (res === SetError.gameNotExists) {
                    ws.emit("gameNotExists");
                } else if (res === SetError.gameFinished) {
                    ws.emit("gameFinished");
                } else if (res === SetError.unknownPlayer) {
                    ws.emit("unknownPlayer")
                } else if (res === SetError.wrongPlayer) {
                    ws.emit("wrongPlayer");
                } else if (res == SetError.fieldFull) {
                    ws.emit("fieldFull")
                } else {
                    ws.emit("playersField", JSON.stringify(Array.from(res.entries())));
                }
            }); //finish

            ws.on("getSumField", (standardGameData: StandardGameData) => {
                let res: Map<string, PointsField> | GetError = this.dicepokerService.routerGetSumField(standardGameData.playerName, standardGameData.serverName);

                if (res == GetError.gameNotExists) {
                    ws.emit("gameNotExists");
                } else if (res == GetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                } else {
                    ws.emit("sumField", JSON.stringify(Array.from(res.entries())));
                }
            }) //finish

            ws.on("setField", (setPointData: SetPointData) => {
                let res: SetError | SetSuccess = this.dicepokerService.routerSetField(setPointData.standardGameData.playerName, setPointData.standardGameData.serverName, setPointData.field);
                let players: Player[] = this.dicepokerService.getPlayers(setPointData.standardGameData.serverName);

                if (res === SetError.gameNotStarted) {
                    ws.emit("gameNotStarted");
                } else if (res === SetError.gameNotExists) {
                    ws.emit("gameNotExists");
                } else if (res === SetError.gameFinished) {
                    ws.emit("gameFinished");
                } else if (res === SetError.unknownPlayer) {
                    ws.emit("unknownPlayer")
                } else if (res === SetError.wrongPlayer) {
                    ws.emit("wrongPlayer");
                } else if (res === SetError.fieldFull) {
                    ws.emit("fieldFull")
                } else if (res === SetSuccess.update) {
                    for (let player of players) {
                        player.socket!.emit("update");
                    }
                } else {
                    let sumField = this.dicepokerService.getSumField(serverName, playerName);
                    let winner = this.dicepokerService.getWinner(serverName, playerName);

                    for (let player of players) {
                        player.socket!.emit("end", {
                            sumField: JSON.stringify(Array.from(sumField.entries())),
                            winner: winner
                        } as End);
                    }
                }
            }) //finish

            ws.on("getActivePlayer", (standardGameData: StandardGameData) => {
                let res: string | GetError = this.dicepokerService.routerGetActivePlayer(standardGameData.playerName, standardGameData.serverName);

                if (res == GetError.gameNotExists) {
                    ws.emit("gameNotExists");
                } else if (res == GetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                } else {
                    ws.emit("activePlayer", res);
                }
            }) //finish

            ws.on("disconnect", () => {
                this.dicepokerService.routerDisconnect(playerName, serverName);
            }) //finish
        });
    }
}