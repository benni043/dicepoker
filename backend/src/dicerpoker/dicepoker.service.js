"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DicepokerService = void 0;
const dicepoker_store_1 = require("./dicepoker.store");
const game_1 = require("../game");
class DicepokerService {
    constructor() {
        this.dicerpokerStore = new dicepoker_store_1.DicepokerStore();
    }
    getAllGames() {
        return this.dicerpokerStore.getAllGames();
    }
    createGame(createData) {
        if (createData.playerCount <= 0) {
            return game_1.Create.illegalPlayer;
        }
        let game = this.dicerpokerStore.gameGetter();
        if (!game.has(createData.serverName)) {
            this.dicerpokerStore.create(createData);
            return game_1.Create.success;
        }
        return game_1.Create.alreadyExists;
    }
    routerJoin(standardGameData, ws) {
        if (this.getGameState(standardGameData.serverName) == game_1.GameState.finished) {
            return game_1.ReturnEnum.gameEnd;
        }
        if (this.getGameState(standardGameData.serverName) == game_1.GameState.running) {
            let player = this.getPlayer(standardGameData.serverName, standardGameData.playerName);
            if (player == null)
                return game_1.ReturnEnum.gameFullErr;
            if (!player.isOnline && player.playerName == standardGameData.playerName) {
                this.dicerpokerStore.rejoin(standardGameData.serverName, standardGameData.playerName, ws);
                return this.getRejoinData(standardGameData.serverName, standardGameData.playerName);
            }
            else {
                return game_1.ReturnEnum.gameFullErr;
            }
        }
        if (this.checkIfPlayerExists(standardGameData.serverName, standardGameData.playerName)) {
            return game_1.ReturnEnum.illegalPlayerErr;
        }
        if (this.dicerpokerStore.gameGetter().has(standardGameData.serverName)) {
            this.dicerpokerStore.join(standardGameData, ws);
            return game_1.ReturnEnum.joinSuccess;
        }
        console.log("error");
        return game_1.ReturnEnum.gameFullErr; //todo invalid
    }
    changeDices(serverName, playerName, dices) {
        let player = this.getPlayer(serverName, playerName);
        let oldDices = [];
        let newDices = [];
        for (let dice of player === null || player === void 0 ? void 0 : player.dices) {
            oldDices.push(dice.dice);
        }
        for (let dice of dices) {
            newDices.push(dice.dice);
        }
        if (oldDices.every((obj) => newDices.includes(obj))) {
            this.dicerpokerStore.changeDices(serverName, playerName, dices);
            return game_1.Change.success;
        }
        else {
            return game_1.Change.illegalArgs;
        }
    }
    getRejoinData(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return game_1.GameNotExists.gameNotExistsError;
        else {
            let me = this.getPlayer(serverName, playerName);
            let activePlayer = this.getActivePlayer(serverName);
            if (me.isOnMove && me.movesLeft > 0) {
                return {
                    type: game_1.RejoinType.dice,
                    dices: me.dices,
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumField(serverName, playerName).entries())),
                    actPlayer: me.playerName,
                    moves: me.movesLeft,
                };
            }
            else if (me.isOnMove && me.movesLeft == 0) {
                return {
                    type: game_1.RejoinType.playerField,
                    dices: me.dices,
                    playerField: JSON.stringify(Array.from(this.dicerpokerStore.getPlayersField(playerName, serverName).entries())),
                    sumField: JSON.stringify(Array.from(this.getSumField(serverName, playerName).entries())),
                    actPlayer: me.playerName,
                    moves: me.movesLeft,
                };
            }
            else {
                return {
                    type: game_1.RejoinType.sumField,
                    dices: activePlayer.dices,
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumField(serverName, playerName).entries())),
                    actPlayer: activePlayer.playerName,
                    moves: activePlayer.movesLeft,
                };
            }
        }
    }
    routerSetDices(receiveDices, playerName, serverName) {
        if (this.getGameState(serverName) == game_1.GameState.finished) {
            return game_1.SetError.gameFinished;
        }
        if (this.getGameState(serverName) == game_1.GameState.joining) {
            return game_1.SetError.gameNotStarted;
        }
        if (this.getGameState(serverName) == game_1.GameState.unknown) {
            return game_1.SetError.gameNotExists;
        }
        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return game_1.SetError.unknownPlayer;
        }
        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return game_1.SetError.wrongPlayer;
        }
        if (this.getPlayerMoves(serverName, playerName) == 3) {
            let dices = [
                { dice: game_1.Dice.one, change: true },
                { dice: game_1.Dice.one, change: true },
                { dice: game_1.Dice.one, change: true },
                { dice: game_1.Dice.one, change: true },
                { dice: game_1.Dice.one, change: true }
            ];
            return this.dicerpokerStore.setDices(dices, playerName, serverName);
        }
        else {
            return this.dicerpokerStore.setDices(receiveDices, playerName, serverName);
        }
    } //finish
    routerSetField(playerName, serverName, field) {
        if (this.getGameState(serverName) == game_1.GameState.finished) {
            return game_1.SetError.gameFinished;
        }
        if (this.getGameState(serverName) == game_1.GameState.joining) {
            return game_1.SetError.gameNotStarted;
        }
        if (this.getGameState(serverName) == game_1.GameState.unknown) {
            return game_1.SetError.gameNotExists;
        }
        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return game_1.SetError.unknownPlayer;
        }
        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return game_1.SetError.wrongPlayer;
        }
        if (!this.checkIfFieldFree(playerName, serverName, field)) {
            return game_1.SetError.fieldFull;
        }
        this.dicerpokerStore.setField(playerName, serverName, field);
        let players = this.getPlayers(serverName);
        let end = this.checkIfGameEnd(players);
        if (!end) {
            return game_1.SetSuccess.update;
        }
        else {
            this.dicerpokerStore.setGameEnd(serverName);
            return game_1.SetSuccess.end;
        }
    } //finish
    routerGetPlayersField(playerName, serverName) {
        if (this.getGameState(serverName) == game_1.GameState.finished) {
            return game_1.SetError.gameFinished;
        }
        if (this.getGameState(serverName) == game_1.GameState.joining) {
            return game_1.SetError.gameNotStarted;
        }
        if (this.getGameState(serverName) == game_1.GameState.unknown) {
            return game_1.SetError.gameNotExists;
        }
        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return game_1.SetError.unknownPlayer;
        }
        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return game_1.SetError.wrongPlayer;
        }
        return this.dicerpokerStore.getPlayersField(playerName, serverName);
    } //finish
    routerGetSumField(playerName, serverName) {
        if (this.getGameState(serverName) == game_1.GameState.joining || this.getGameState(serverName) == game_1.GameState.unknown) {
            return game_1.GetError.gameNotExists;
        }
        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return game_1.GetError.unknownPlayer;
        }
        return this.dicerpokerStore.getSumField(playerName, serverName);
    } //finish
    routerGetActivePlayer(playerName, serverName) {
        if (this.getGameState(serverName) == game_1.GameState.joining || this.getGameState(serverName) == game_1.GameState.unknown) {
            return game_1.GetError.gameNotExists;
        }
        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return game_1.GetError.unknownPlayer;
        }
        let players = this.getPlayers(serverName);
        let activePlayer = "";
        for (let player of players) {
            if (player.isOnMove) {
                activePlayer = player.playerName;
                break;
            }
        }
        return activePlayer;
    } //finish
    routerDisconnect(playerName, serverName) {
        if (this.getGameState(serverName) == game_1.GameState.joining || this.getGameState(serverName) == game_1.GameState.running || this.getGameState(serverName) == game_1.GameState.finished) {
            this.dicerpokerStore.disconnect(playerName, serverName);
            return null;
        }
        else {
            return game_1.GetError.gameNotExists;
        }
    } //finish
    //CHECK-FUNCTIONS
    checkIfPlayerExists(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return false;
        else {
            let players = this.getPlayers(serverName);
            for (let player of players) {
                if (player.playerName == playerName)
                    return true;
            }
        }
        return false;
    } //finish
    checkIfPlayerIsOnTurn(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return false;
        else {
            let players = this.getPlayers(serverName);
            for (let player of players) {
                if (player.isOnMove)
                    return true;
            }
        }
        return false;
    } //finish
    checkIfFieldFree(playerName, serverName, field) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return false;
        let player = this.getActivePlayer(serverName);
        switch (field) {
            case "ones": {
                if (player.pointsField.ones != -1)
                    return false;
                break;
            }
            case "twos": {
                if (player.pointsField.twos != -1)
                    return false;
                break;
            }
            case "threes": {
                if (player.pointsField.threes != -1)
                    return false;
                break;
            }
            case "fours": {
                if (player.pointsField.fours != -1)
                    return false;
                break;
            }
            case "fives": {
                if (player.pointsField.fives != -1)
                    return false;
                break;
            }
            case "sixes": {
                if (player.pointsField.sixes != -1)
                    return false;
                break;
            }
            case "fullHouse": {
                if (player.pointsField.fullHouse != -1)
                    return false;
                break;
            }
            case "street": {
                if (player.pointsField.street != -1)
                    return false;
                break;
            }
            case "poker": {
                if (player.pointsField.poker != -1)
                    return false;
                break;
            }
            case "grande": {
                if (player.pointsField.grande != -1)
                    return false;
                break;
            }
            case "doubleGrande": {
                if (player.pointsField.doubleGrande != -1)
                    return false;
                break;
            }
        }
        return true;
    }
    checkIfGameEnd(players) {
        for (let player of players) {
            for (const [key, value] of Object.entries(player.pointsField)) {
                if (value === -1) {
                    return false;
                }
            }
        }
        return true;
    } //finish
    //GET-FUNCTIONS
    getGameState(serverName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return game_1.GameState.unknown;
        else
            return game.state;
    } //finish
    getPlayers(serverName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return [];
        else {
            return game.players;
        }
    } //finish
    getPlayer(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return null;
        else {
            let players = this.getPlayers(serverName);
            for (let player of players) {
                if (player.playerName == playerName) {
                    return player;
                }
            }
        }
    } //finish
    getPlayerMoves(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return 0;
        else {
            let player = this.getPlayer(serverName, playerName);
            return player.movesLeft;
        }
    } //finish
    getSumField(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return new Map();
        else {
            let players = this.getPlayers(serverName);
            let map = new Map();
            for (let player of players) {
                map.set(player.playerName, player.pointsField);
            }
            return map;
        }
    } //check
    getWinner(serverName, playerName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return "";
        else {
            let winner = "";
            let points = -1;
            let players = this.getPlayers(serverName);
            for (let player of players) {
                if (player.points > points) {
                    winner = player.playerName;
                    points = player.points;
                }
            }
            return winner;
        }
    }
    getActivePlayer(serverName) {
        let game = this.dicerpokerStore.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return undefined;
        else {
            let players = this.getPlayers(serverName);
            for (let player of players) {
                if (player.isOnMove) {
                    return player;
                }
            }
        }
    }
}
exports.DicepokerService = DicepokerService;
