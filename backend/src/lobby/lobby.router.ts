import {Server, Socket} from "socket.io";
import express, {Router} from "express";
import {DicepokerService} from "../dicerpoker/dicepoker.service";
import {Create, CreateData, GameNotExists, RejoinData, ReturnEnum, StandardGameData} from "../game";

export class LobbyRouter {
    router = Router();

    dicepokerService: DicepokerService = new DicepokerService();

    constructor(app: express.Application, socketIO: Server) {
        app.use("/lobby", this.router)

        socketIO.of('/lobby').on('connection', (ws: Socket) => {
            let playerName: string
            let serverName: string

            console.log(`${ws} connected to lobby`);

            ws.emit("isInGame");

            ws.on("getAllGames", () => {
                ws.emit("getGames", this.dicepokerService.getAllGames());
            })

            ws.on("createGame", (createGameData: CreateData) => {
                let res = this.dicepokerService.createGame(createGameData);

                if (res == Create.illegalPlayer) {
                    ws.emit("illegalPlayerArgs");
                } else if (res == Create.alreadyExists) {
                    ws.emit("gameAlreadyExists");
                } else {
                    socketIO.of('/lobby').emit("getGames", this.dicepokerService.getAllGames());
                }
            })

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

            ws.on('disconnect', () => {
                console.log('Dice Poker client disconnected');
            });
        });
    }
}