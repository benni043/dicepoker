import express from "express";
import cors from "cors";
import * as http from "http";
import {Server} from "socket.io";
import {DicepokerService} from "./dicepoker.service";
import {
    JoinReturn,
    ReturnEnum,
    SetPointData,
    SetPointsReturn,
    StandardGameData,
    ThrowData,
    ThrowReturn
} from "../game";

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
                    res.response!.player1ws.emit("joinSuccess", res.response!.responseDicesPlayer1);

                    if (res.response!.player2ws != undefined) {
                        res.response!.player2ws.emit("joinSuccess", res.response!.responseDicesPlayer2);
                    }
                } else if (res.returnEnum == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res.returnEnum == ReturnEnum.gameFullErr) {
                    ws.emit("gameFullErr")
                }
            });

            ws.on("throw", (throwData: ThrowData) => {
                let res: ThrowReturn = this.dicepokerService.throw(throwData.receiveDices, throwData.standardGameData.playerName, throwData.standardGameData.serverName);

                if (res.returnEnum == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res.returnEnum == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res.returnEnum == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res.returnEnum == ReturnEnum.throwSuccess) {
                    ws.emit("throwSuccess", res.response);
                } else if (res.returnEnum == ReturnEnum.turnIsOver) {
                    ws.emit("turnIsOver");
                } else if (res.returnEnum == ReturnEnum.throwSuccessEnd) {
                    ws.emit("throwSuccessEnd", {sumField: JSON.stringify(Array.from(res.sumField!.entries())), dices: res.response})
                }
            });

            ws.on("setPoint", (setPointData: SetPointData) => {
                let res: SetPointsReturn = this.dicepokerService.setPoints(setPointData.standardGameData.playerName, setPointData.standardGameData.serverName, setPointData.field);

                if (res.returnEnum == ReturnEnum.gameNotStartedErr) {
                    ws.emit("gameNotStartedErr");
                } else if (res.returnEnum == ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                } else if (res.returnEnum == ReturnEnum.playerNotOnTurnErr) {
                    ws.emit("playerNotOnTurnErr")
                } else if (res.returnEnum == ReturnEnum.turnIsNotOver) {
                    ws.emit("turnIsNotOver");
                } else if (res.returnEnum == ReturnEnum.setSuccess) {
                    ws.emit("setSuccess", JSON.stringify(Array.from(res.sumField!.entries())));
                }
            })
        });

        this.server.listen(this.port, () => {
            console.log(`started dicepoker on port ${this.port}`)
        })
    }
}