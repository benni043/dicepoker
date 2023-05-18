import express from "express";
import cors from "cors";
import * as http from "http";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {
    GameNotExists,
    Player,
    PointsField, RejoinData,
    ReturnEnum,
    SetPointData,
    StandardGameData,
    Throw,
    ThrowData
} from "../game";
import path from "path";

export class DicepokerRouter {

    dicepokerService: DicepokerService = new DicepokerService();

    app = express();
    server = http.createServer(this.app);
    socketIO = new Server(this.server, {cors: {origin: true}});
    port = 3000;

    constructor() {
        this.app.use(cors());

        this.app.use(express.static(path.join(__dirname, '../../../frontend/dist/frontend')));
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../../frontend/dist/frontend/index.html'));
            res.end()
        });

        this.socketIO.on("connection", (ws) => {
            let playerName: string
            let serverName: number

            ws.on("joinToGame", (standardGameData: StandardGameData) => {
                let res = this.dicepokerService.routerJoin(standardGameData, ws);
                let players = this.dicepokerService.getPlayers(standardGameData.serverName, standardGameData.playerName);
                let sumField = this.dicepokerService.getSumF(standardGameData.serverName, standardGameData.playerName);

                if (res == GameNotExists.gameNotExistsError) {
                    ws.emit("gameNotExistsErr");
                } else if (res == ReturnEnum.gameFullErr) {
                    ws.emit("gameFullErr")
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr")
                } else if (res == ReturnEnum.joinSuccess) {
                    playerName = standardGameData.playerName
                    serverName = standardGameData.serverName;

                    for (let player of players) {
                        if (player.socket != undefined) {
                            player.socket?.emit("joinSuccess", {sumField: JSON.stringify(Array.from(sumField.entries()))})
                        }
                    }
                } else if (typeof res === "object"){
                    playerName = standardGameData.playerName
                    serverName = standardGameData.serverName;

                    let rejoinData: RejoinData = res;

                    ws.emit("rejoin", (rejoinData))
                }
            });

            ws.on("throw", (throwData: ThrowData) => {
                let res: Throw = this.dicepokerService.routerGetNewDices(throwData.receiveDices, throwData.standardGameData.playerName, throwData.standardGameData.serverName);

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
                let res: Map<string, PointsField> | ReturnEnum = this.dicepokerService.routerGetPlayersField(standardGameData.playerName, standardGameData.serverName);

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
                let res: Map<string, PointsField> | ReturnEnum = this.dicepokerService.routerGetSumField(standardGameData.playerName, standardGameData.serverName);
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
                let res: ReturnEnum = this.dicepokerService.routerSetValueToPlayersField(setPointData.standardGameData.playerName, setPointData.standardGameData.serverName, setPointData.field);
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
                let res: string | ReturnEnum = this.dicepokerService.routerTurnChange(standardGameData.playerName, standardGameData.serverName);
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
                this.dicepokerService.routerDisconnect(playerName, serverName);
            })

        });

        this.server.listen(this.port, () => {
            console.log(`started dicepoker on port ${this.port}`)
        })
    }
}