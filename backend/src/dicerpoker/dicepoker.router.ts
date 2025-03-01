import express, {Router} from "express";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {
    Change,
    End, GameNotExists,
    GetError,
    Player,
    PointsField, RejoinData, ReturnEnum,
    SetError,
    SetPointData,
    SetSuccess,
    StandardGameData,
    ThrowData,
    UpdateDices
} from "../game";

export class DicepokerRouter {

    router = Router();
    dicepokerService: DicepokerService = DicepokerService.getInstance();

    constructor(app: express.Application, socketIO: Server) {
        app.use("/dicepoker", this.router)

        socketIO.of('/dicepoker').on("connection", (ws) => {
            let playerName: string
            let serverName: string

            console.log(`${ws.id} connected to game`);

            ws.on("joinToGame", (standardGameData: StandardGameData) => {
                let res = this.dicepokerService.routerJoin(standardGameData, ws);
                let players = this.dicepokerService.getPlayers(standardGameData.serverName);

                if (res == GameNotExists.gameNotExistsError) {
                    ws.emit("gameNotExistsErr");
                } else if (res == ReturnEnum.gameFullErr) {
                    ws.emit("gameFullErr")
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr")
                } else if (res == ReturnEnum.gameEnd) {
                    ws.emit("gameEnd")
                } else if (res == ReturnEnum.joinSuccess) {
                    playerName = standardGameData.playerName
                    serverName = standardGameData.serverName;

                    let sumField = this.dicepokerService.getSumField(serverName, playerName)

                    for (let player of players) {
                        if (player.socket != undefined) {
                            player.socket?.emit("joinSuccess", {sumField: JSON.stringify(Array.from(sumField.entries()))})
                        }
                    }
                } else if (typeof res === "object") {
                    playerName = standardGameData.playerName
                    serverName = standardGameData.serverName;

                    let rejoinData: RejoinData = res;

                    ws.emit("rejoin", (rejoinData))
                }
            });

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
                console.log(`${ws.id} disconnected from game`);
                this.dicepokerService.routerDisconnect(playerName, serverName);
            }) //finish
        });
    }
}