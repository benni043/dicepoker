import {Server, Socket} from "socket.io";
import express, {Router} from "express";
import {DicepokerService} from "../dicerpoker/dicepoker.service";
import {Create, CreateData} from "../game";

export class LobbyRouter {
    router = Router();

    dicepokerService: DicepokerService = DicepokerService.getInstance();

    constructor(app: express.Application, socketIO: Server) {
        app.use("/lobby", this.router)

        socketIO.of('/lobby').on('connection', (ws: Socket) => {
            console.log(`${ws.id} connected to lobby`);

            ws.emit("isInGame");

            ws.on("getAllGames", () => {
                console.log(this.dicepokerService.getAllGames())
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

            ws.on('disconnect', () => {
                console.log(`${ws.id} disconnected from lobby`);
            });
        });
    }
}