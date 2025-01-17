"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DicepokerRouter = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
const dicepoker_service_1 = require("./dicepoker.service");
const game_1 = require("../game");
const path_1 = __importDefault(require("path"));
class DicepokerRouter {
    constructor() {
        this.dicepokerService = new dicepoker_service_1.DicepokerService();
        this.app = (0, express_1.default)();
        this.server = http.createServer(this.app);
        this.socketIO = new socket_io_1.Server(this.server, { cors: { origin: true }, pingInterval: 5000 });
        this.port = 3000;
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../../../frontend/dist/frontend')));
        this.app.get('/', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, '../../../frontend/dist/frontend/index.html'));
            res.end();
        });
        this.socketIO.on("connection", (ws) => {
            let playerName;
            let serverName;
            ws.emit("isInGame");
            ws.on("getAllGames", () => {
                ws.emit("getGames", this.dicepokerService.getAllGames());
            });
            ws.on("createGame", (createGameData) => {
                let res = this.dicepokerService.createGame(createGameData);
                if (res == game_1.Create.illegalPlayer) {
                    ws.emit("illegalPlayerArgs");
                }
                else if (res == game_1.Create.alreadyExists) {
                    ws.emit("gameAlreadyExists");
                }
                else {
                    this.socketIO.emit("getGames", this.dicepokerService.getAllGames());
                }
            });
            ws.on("joinToGame", (standardGameData) => {
                var _a;
                let res = this.dicepokerService.routerJoin(standardGameData, ws);
                let players = this.dicepokerService.getPlayers(standardGameData.serverName);
                if (res == game_1.GameNotExists.gameNotExistsError) {
                    ws.emit("gameNotExistsErr");
                }
                else if (res == game_1.ReturnEnum.gameFullErr) {
                    ws.emit("gameFullErr");
                }
                else if (res == game_1.ReturnEnum.illegalPlayerErr) {
                    ws.emit("illegalPlayerErr");
                }
                else if (res == game_1.ReturnEnum.gameEnd) {
                    ws.emit("gameEnd");
                }
                else if (res == game_1.ReturnEnum.joinSuccess) {
                    playerName = standardGameData.playerName;
                    serverName = standardGameData.serverName;
                    let sumField = this.dicepokerService.getSumField(serverName, playerName);
                    for (let player of players) {
                        if (player.socket != undefined) {
                            (_a = player.socket) === null || _a === void 0 ? void 0 : _a.emit("joinSuccess", { sumField: JSON.stringify(Array.from(sumField.entries())) });
                        }
                    }
                }
                else if (typeof res === "object") {
                    playerName = standardGameData.playerName;
                    serverName = standardGameData.serverName;
                    let rejoinData = res;
                    ws.emit("rejoin", (rejoinData));
                }
            });
            ws.on("sendNewDices", (data) => {
                var _a;
                let players = this.dicepokerService.getPlayers(data.standardGameData.serverName);
                let res = this.dicepokerService.changeDices(data.standardGameData.serverName, data.standardGameData.playerName, data.dices);
                if (res == game_1.Change.illegalArgs) {
                    ws.emit("illegalDiceArgs");
                }
                else {
                    for (let player of players) {
                        (_a = player.socket) === null || _a === void 0 ? void 0 : _a.emit("newChangedDices", (data.dices));
                    }
                }
            }); //finish
            ws.on("setDices", (throwData) => {
                var _a;
                let res = this.dicepokerService.routerSetDices(throwData.receiveDices, throwData.standardGameData.playerName, throwData.standardGameData.serverName);
                let players = this.dicepokerService.getPlayers(throwData.standardGameData.serverName);
                if (res === game_1.SetError.gameNotStarted) {
                    ws.emit("gameNotStarted");
                }
                else if (res === game_1.SetError.gameNotExists) {
                    ws.emit("gameNotExists");
                }
                else if (res === game_1.SetError.gameFinished) {
                    ws.emit("gameFinished");
                }
                else if (res === game_1.SetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                }
                else if (res === game_1.SetError.wrongPlayer) {
                    ws.emit("wrongPlayer");
                }
                else {
                    for (let player of players) {
                        (_a = player.socket) === null || _a === void 0 ? void 0 : _a.emit("newDices", res);
                    }
                }
            }); //finish
            ws.on("getPlayersField", (standardGameData) => {
                let res = this.dicepokerService.routerGetPlayersField(standardGameData.playerName, standardGameData.serverName);
                if (res === game_1.SetError.gameNotStarted) {
                    ws.emit("gameNotStarted");
                }
                else if (res === game_1.SetError.gameNotExists) {
                    ws.emit("gameNotExists");
                }
                else if (res === game_1.SetError.gameFinished) {
                    ws.emit("gameFinished");
                }
                else if (res === game_1.SetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                }
                else if (res === game_1.SetError.wrongPlayer) {
                    ws.emit("wrongPlayer");
                }
                else if (res == game_1.SetError.fieldFull) {
                    ws.emit("fieldFull");
                }
                else {
                    ws.emit("playersField", JSON.stringify(Array.from(res.entries())));
                }
            }); //finish
            ws.on("getSumField", (standardGameData) => {
                let res = this.dicepokerService.routerGetSumField(standardGameData.playerName, standardGameData.serverName);
                if (res == game_1.GetError.gameNotExists) {
                    ws.emit("gameNotExists");
                }
                else if (res == game_1.GetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                }
                else {
                    ws.emit("sumField", JSON.stringify(Array.from(res.entries())));
                }
            }); //finish
            ws.on("setField", (setPointData) => {
                let res = this.dicepokerService.routerSetField(setPointData.standardGameData.playerName, setPointData.standardGameData.serverName, setPointData.field);
                let players = this.dicepokerService.getPlayers(setPointData.standardGameData.serverName);
                if (res === game_1.SetError.gameNotStarted) {
                    ws.emit("gameNotStarted");
                }
                else if (res === game_1.SetError.gameNotExists) {
                    ws.emit("gameNotExists");
                }
                else if (res === game_1.SetError.gameFinished) {
                    ws.emit("gameFinished");
                }
                else if (res === game_1.SetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                }
                else if (res === game_1.SetError.wrongPlayer) {
                    ws.emit("wrongPlayer");
                }
                else if (res === game_1.SetError.fieldFull) {
                    ws.emit("fieldFull");
                }
                else if (res === game_1.SetSuccess.update) {
                    for (let player of players) {
                        player.socket.emit("update");
                    }
                }
                else {
                    let sumField = this.dicepokerService.getSumField(serverName, playerName);
                    let winner = this.dicepokerService.getWinner(serverName, playerName);
                    for (let player of players) {
                        player.socket.emit("end", {
                            sumField: JSON.stringify(Array.from(sumField.entries())),
                            winner: winner
                        });
                    }
                }
            }); //finish
            ws.on("getActivePlayer", (standardGameData) => {
                let res = this.dicepokerService.routerGetActivePlayer(standardGameData.playerName, standardGameData.serverName);
                if (res == game_1.GetError.gameNotExists) {
                    ws.emit("gameNotExists");
                }
                else if (res == game_1.GetError.unknownPlayer) {
                    ws.emit("unknownPlayer");
                }
                else {
                    ws.emit("activePlayer", res);
                }
            }); //finish
            ws.on("disconnect", () => {
                this.dicepokerService.routerDisconnect(playerName, serverName);
            }); //finish
        });
        this.server.listen(this.port, () => {
            console.log(`started dicepoker on port ${this.port}`);
        }); //finish
    }
}
exports.DicepokerRouter = DicepokerRouter;
