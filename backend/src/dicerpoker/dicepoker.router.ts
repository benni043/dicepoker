import express from "express";
import cors from "cors";
import * as http from "http";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {Player, PointsField, ReturnEnum, SetPointData, StandardGameData, Throw, ThrowData} from "../game";

export class DicepokerRouter {

    dicepokerService: DicepokerService = new DicepokerService();

    app = express();
    server = http.createServer(this.app);
    socketIO = new Server(this.server, {cors: {origin: true}});
    port = 3000;

    constructor() {
        this.app.use(cors());

        this.socketIO.on("connection", (ws) => {
            let playerName: string
            let serverName: number

            ws.on("joinToGame", (standardGameData: StandardGameData) => {
                let res = this.dicepokerService.join(standardGameData, ws);
                let players = this.dicepokerService.getPlayers(standardGameData.serverName, standardGameData.playerName);
                let sumField = this.dicepokerService.getSumF(standardGameData.serverName, standardGameData.playerName);

                if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.gameFullErr) {
                    ws.emit("gameFullErr")
                } else if (res == ReturnEnum.rejoin) {
                    ws.emit("rejoin")
                } else {
                    playerName = standardGameData.playerName
                    serverName = standardGameData.serverName;

                    for (let player of players) {
                        if (player.socket != undefined) {
                            player.socket?.emit("joinSuccess", {sumField: JSON.stringify(Array.from(sumField.entries()))})
                        }
                    }
                }
            });

            ws.on("getRejoinData", (standardGameData: StandardGameData) => {

            })

            ws.on("throw", (throwData: ThrowData) => {
                let res: Throw = this.dicepokerService.getNewDices(throwData.receiveDices, throwData.standardGameData.playerName, throwData.standardGameData.serverName);
                let players: Player[] = this.dicepokerService.getPlayers(throwData.standardGameData.serverName, throwData.standardGameData.playerName);

                if (res.returnEnum == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res.returnEnum == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res.returnEnum == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res.returnEnum == ReturnEnum.turnIsOver) {
                    ws.emit("turnIsOver");
                } else if (res.returnEnum == ReturnEnum.moves0) {
                    for (let player of players) {
                        player.socket!.emit("throwSuccess", res.dices);
                    }
                    ws.emit("moves0");
                } else if (res.returnEnum == ReturnEnum.throwSuccess) {
                    for (let player of players) {
                        player.socket!.emit("throwSuccess", res.dices);
                    }
                }
            });

            ws.on("getPlayersField", (standardGameData: StandardGameData) => {
                let res: Map<string, PointsField> | ReturnEnum = this.dicepokerService.getPlayersField(standardGameData.playerName, standardGameData.serverName);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                } else if ((res instanceof Map<string, PointsField>)) {
                    ws.emit("setPlayersField", JSON.stringify(Array.from(res.entries())));
                }
            });

            ws.on("getSumField", (standardGameData: StandardGameData) => {
                let res: Map<string, PointsField> | ReturnEnum = this.dicepokerService.getSumField(standardGameData.playerName, standardGameData.serverName);
                let players: Player[] = this.dicepokerService.getPlayers(standardGameData.serverName, standardGameData.playerName);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                } else if ((res instanceof Map<string, PointsField>)) {
                    for (let player of players) {
                        player.socket!.emit("setSumField", JSON.stringify(Array.from(res.entries())));
                    }
                }
            })

            ws.on("setField", (setPointData: SetPointData) => {
                let res: ReturnEnum = this.dicepokerService.setValueToPlayersField(setPointData.standardGameData.playerName, setPointData.standardGameData.serverName, setPointData.field);
                let players: Player[] = this.dicepokerService.getPlayers(setPointData.standardGameData.serverName, setPointData.standardGameData.playerName);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                } else if (res == ReturnEnum.fieldAlreadySetErr) {
                    ws.emit("fieldAlreadySetErr")
                } else if (res == ReturnEnum.setSuccess) {
                    ws.emit("setSuccess");
                } else {
                    ws.emit("setSuccess");

                    let playersAndSums: {playerName: string, points: number}[] = [];
                    for (let player of players) {
                        playersAndSums.push({playerName: player.playerName, points: player.points})
                    }

                    for (let player of players) {
                        player.socket?.emit("end", (playersAndSums))
                    }
                }
            })

            ws.on("turnChange", (standardGameData: StandardGameData) => {
                let res: string | ReturnEnum = this.dicepokerService.turnChange(standardGameData.playerName, standardGameData.serverName);
                let players: Player[] = this.dicepokerService.getPlayers(standardGameData.serverName, standardGameData.playerName);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else {
                    for (let player of players) {
                        player.socket?.emit("playerTurnInformation", (res))
                    }
                }
            })

            ws.on("disconnect", () => {
                this.dicepokerService.disconnect(playerName, serverName);
            })

        });

        this.server.listen(this.port, () => {
            console.log(`started dicepoker on port ${this.port}`)
        })
    }
}