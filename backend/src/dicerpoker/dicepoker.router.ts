import express from "express";
import cors from "cors";
import * as http from "http";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {
    End,
    GameNotExists,
    GetError,
    NewDices,
    Player,
    PointsField,
    RejoinData,
    ReturnEnum,
    SetError,
    SetPointData,
    SetSuccess,
    StandardGameData,
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
                let players = this.dicepokerService.getPlayers(standardGameData.serverName);
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
                } else if (typeof res === "object") {
                    playerName = standardGameData.playerName
                    serverName = standardGameData.serverName;

                    let rejoinData: RejoinData = res;

                    ws.emit("rejoin", (rejoinData))
                }
            });

            ws.on("switched", (data: { newDices: NewDices, standardGameData: StandardGameData }) => {
                let players: Player[] = this.dicepokerService.getPlayers(data.standardGameData.serverName);

                for (let player of players) {
                    player.socket?.emit("switched", (data.newDices))
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
                    ws.emit("setPlayersField", JSON.stringify(Array.from(res.entries())));
                }
            }); //finish

            ws.on("getSumField", (standardGameData: StandardGameData) => {
                let res: Map<string, PointsField> | GetError = this.dicepokerService.routerGetSumField(standardGameData.playerName, standardGameData.serverName);

                if (res == GetError.gameNotExists) {
                    ws.emit("gameNotExists");
                } else if (res == GetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                } else {
                    ws.emit("setSumField", JSON.stringify(Array.from(res.entries())));
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
                    let sumField = this.dicepokerService.getSumF(serverName, playerName);
                    let winner = this.dicepokerService.getWinner(serverName, playerName);

                    for (let player of players) {
                        player.socket!.emit("end", {sumField: JSON.stringify(Array.from(sumField.entries())), winner: winner} as End);
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
                    ws.emit("setActivePlayer", res);
                }
            }) //finish

            ws.on("disconnect", () => {
                this.dicepokerService.routerDisconnect(playerName, serverName);
            }) //finish

        });

        this.server.listen(this.port, () => {
            console.log(`started dicepoker on port ${this.port}`)
        }) //finish
    }
}