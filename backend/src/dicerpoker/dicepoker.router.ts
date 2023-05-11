import express from "express";
import cors from "cors";
import * as http from "http";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {JoinReturn, PointsField, ReturnEnum, SetPointData, StandardGameData, Throw, ThrowData} from "../game";

export class DicepokerRouter {

    dicepokerService: DicepokerService = new DicepokerService();

    app = express();
    server = http.createServer(this.app);
    socketIO = new Server(this.server, {cors: {origin: true}});
    port = 3000;

    constructor() {
        this.app.use(cors());

        this.socketIO.on("connection", (ws) => {

            ws.on("joinToGame", (standardGameData: StandardGameData) => {
                let res: JoinReturn = this.dicepokerService.join(standardGameData, ws);

                if (res.returnEnum == ReturnEnum.joinSuccess) {
                    res.response!.player1ws.emit("joinSuccess");

                    if (res.response!.player2ws != undefined) {
                        res.response!.player2ws.emit("joinSuccess");
                    }
                } else if (res.returnEnum == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res.returnEnum == ReturnEnum.gameFullErr) {
                    ws.emit("gameFullErr")
                }
            });

            ws.on("throw", (throwData: ThrowData) => {
                let res: Throw | ReturnEnum = this.dicepokerService.throw(throwData.receiveDices, throwData.standardGameData.playerName, throwData.standardGameData.serverName);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsOver) {
                    ws.emit("turnIsOver");
                } else
                    ws.emit("throwSuccess", res);
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
                }
                if ((res instanceof Map<string, PointsField>)) {
                    ws.emit("setPlayersField", JSON.stringify(Array.from(res.entries())));
                }
            });

            ws.on("getSumField", (standardGameData: StandardGameData) => {
                let res: Map<string, PointsField> | ReturnEnum = this.dicepokerService.getSumField(standardGameData.playerName, standardGameData.serverName);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                }

                if ((res instanceof Map<string, PointsField>)) {
                    ws.emit("setSumField", JSON.stringify(Array.from(res.entries())));
                }
            })

            ws.on("setField", (setPointData: SetPointData) => {
                let res: ReturnEnum = this.dicepokerService.setPoint(setPointData.standardGameData.playerName, setPointData.standardGameData.serverName, setPointData.field);

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                } else if (res == ReturnEnum.setSuccess) {
                    ws.emit("setSuccess");
                }
            })

            ws.on("turnChange", (standardGameData: StandardGameData) => {
                let res: string | ReturnEnum = this.dicepokerService.turnChange(standardGameData.playerName, standardGameData.serverName);
                console.log(4)

                if (res == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                } else {
                    console.log(3)
                    ws.emit("yourTurn", res)
                }
            })
        });

        this.server.listen(this.port, () => {
            console.log(`started dicepoker on port ${this.port}`)
        })
    }
}