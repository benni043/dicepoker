import {DicepokerRouter} from "./dicerpoker/dicepoker.router";
import express from "express";
import * as http from "node:http";
import {Server} from "socket.io";
import cors from "cors";
import path from "path";
import {LobbyRouter} from "./lobby/lobby.router";

export class MainServer {
    app = express();
    server = http.createServer(this.app);
    socketIO = new Server(this.server, {cors: {origin: true}, pingInterval: 5000});
    port = 3000;

    constructor() {
        this.app.use(cors());

        // Static files
        this.app.use(express.static(path.join(__dirname, '../../../frontend/dist/frontend')));
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../../../frontend/dist/frontend/index.html'));
        });

        // Initialize routers
        new DicepokerRouter(this.app, this.socketIO);
        new LobbyRouter(this.app, this.socketIO);

        // Start the server
        this.server.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }
}

// Start the server
new MainServer();