"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DicepokerStore = void 0;
const game_1 = require("../game");
class DicepokerStore {
    constructor() {
        this.game = new Map();
        this.dices = [game_1.Dice.one, game_1.Dice.two, game_1.Dice.three, game_1.Dice.four, game_1.Dice.five, game_1.Dice.six];
    }
    gameGetter() {
        return this.game;
    }
    getAllGames() {
        let games = [];
        for (let key of this.game.keys()) {
            games.push(key);
        }
        return games;
    }
    create(createData) {
        let players = [];
        for (let i = 0; i < createData.playerCount; i++) {
            let player = {
                playerName: "joining" + i,
                isOnline: false,
                dices: [],
                holdDices: [],
                movesLeft: 3,
                points: 0,
                socket: undefined,
                isOnMove: false,
                pointsField: {
                    ones: -1,
                    twos: -1,
                    threes: -1,
                    fours: -1,
                    fives: -1,
                    sixes: -1,
                    fullHouse: -1,
                    street: -1,
                    poker: -1,
                    grande: -1,
                    doubleGrande: -1,
                    sum: 0
                },
                pointsFieldTMP: {
                    ones: -1,
                    twos: -1,
                    threes: -1,
                    fours: -1,
                    fives: -1,
                    sixes: -1,
                    fullHouse: -1,
                    street: -1,
                    poker: -1,
                    grande: -1,
                    doubleGrande: -1,
                    sum: 0
                }
            };
            players.push(player);
        }
        this.game.set(createData.serverName, {
            players: players,
            state: game_1.GameState.joining,
            numberOfPlayersJoined: 0,
            numberOfPlayersWhoLeft: 0
        });
    }
    join(standardGameData, ws) {
        let game = this.game.get(standardGameData.serverName);
        game.numberOfPlayersJoined++;
        game.players[game.numberOfPlayersJoined - 1].playerName = standardGameData.playerName;
        game.players[game.numberOfPlayersJoined - 1].isOnline = true;
        game.players[game.numberOfPlayersJoined - 1].socket = ws;
        if (game.numberOfPlayersJoined == game.players.length) {
            game.state = game_1.GameState.running;
            game.players[0].isOnMove = true;
        }
    }
    getPlayer(serverName, playerName) {
        let game = this.getGame(serverName);
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
    }
    getPlayers(serverName) {
        let game = this.getGame(serverName);
        if (game == game_1.GameNotExists.gameNotExistsError)
            return [];
        else {
            return game.players;
        }
    } //finish
    rejoin(serverName, playerName, ws) {
        let game = this.game.get(serverName);
        let player = this.getPlayer(serverName, playerName);
        player.isOnline = true;
        game.numberOfPlayersWhoLeft--;
        player.socket = ws;
    }
    changeDices(serverName, playerName, dices) {
        let player = this.getPlayer(serverName, playerName);
        player.dices = dices;
    }
    setDices(receiveDices, playerName, serverName) {
        let newDices = [];
        let player = this.getPlayer(serverName, playerName);
        for (let receiveDice of receiveDices) {
            if (receiveDice.change) {
                newDices.push({ dice: this.getRandomDice(), change: true });
            }
            else {
                newDices.push({ dice: receiveDice.dice, change: false });
            }
        }
        this.setPlayerSettings(serverName, playerName, newDices);
        return { newDices: newDices, moves: player.movesLeft };
    } //finish
    setGameEnd(serverName) {
        this.game.get(serverName).state = game_1.GameState.finished;
    } //finish
    getNextValue(players, player) {
        const currentIndex = players.indexOf(player);
        const nextIndex = (currentIndex + 1) % players.length; // Verwendet den Modulo-Operator, um sicherzustellen, dass der Index innerhalb der Array-Grenzen bleibt
        return players[nextIndex];
    }
    setField(playerName, serverName, field) {
        let player = this.getPlayer(serverName, playerName);
        let opponent = this.getNextValue(this.getPlayers(serverName), player);
        switch (field) {
            case "ones": {
                player.pointsField.ones = player.pointsFieldTMP.ones;
                player.points += player.pointsField.ones;
                break;
            }
            case "twos": {
                player.pointsField.twos = player.pointsFieldTMP.twos;
                player.points += player.pointsField.twos;
                break;
            }
            case "threes": {
                player.pointsField.threes = player.pointsFieldTMP.threes;
                player.points += player.pointsField.threes;
                break;
            }
            case "fours": {
                player.pointsField.fours = player.pointsFieldTMP.fours;
                player.points += player.pointsField.fours;
                break;
            }
            case "fives": {
                player.pointsField.fives = player.pointsFieldTMP.fives;
                player.points += player.pointsField.fives;
                break;
            }
            case "sixes": {
                player.pointsField.sixes = player.pointsFieldTMP.sixes;
                player.points += player.pointsField.sixes;
                break;
            }
            case "fullHouse": {
                player.pointsField.fullHouse = player.pointsFieldTMP.fullHouse;
                player.points += player.pointsField.fullHouse;
                break;
            }
            case "street": {
                player.pointsField.street = player.pointsFieldTMP.street;
                player.points += player.pointsField.street;
                break;
            }
            case "poker": {
                player.pointsField.poker = player.pointsFieldTMP.poker;
                player.points += player.pointsField.poker;
                break;
            }
            case "grande": {
                player.pointsField.grande = player.pointsFieldTMP.grande;
                player.points += player.pointsField.grande;
                break;
            }
            case "doubleGrande": {
                player.pointsField.doubleGrande = player.pointsFieldTMP.doubleGrande;
                player.points += player.pointsField.doubleGrande;
                break;
            }
        }
        player.pointsField.sum = player.points;
        player.isOnMove = false;
        player.dices = [{ dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true }];
        opponent.isOnMove = true;
        opponent.dices = [{ dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true },
            { dice: game_1.Dice.one, change: true }];
        player.movesLeft = 3;
        player.pointsFieldTMP = {
            ones: 0,
            twos: 0,
            threes: 0,
            fours: 0,
            fives: 0,
            sixes: 0,
            fullHouse: 0,
            street: 0,
            poker: 0,
            grande: 0,
            doubleGrande: 0,
            sum: 0,
        };
    } //finish
    getActivePlayer(serverName) {
        let game = this.getGame(serverName);
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
    getPlayersField(playerName, serverName) {
        let player = this.getActivePlayer(serverName);
        let map = new Map();
        map.set(player.playerName, player.pointsFieldTMP);
        return map;
    } //finish
    getSumField(playerName, serverName) {
        let players = this.getPlayers(serverName);
        let map = new Map();
        for (let player of players) {
            map.set(player.playerName, player.pointsField);
        }
        return map;
    } //finish
    setPlayerSettings(serverName, playerName, dices) {
        let player = this.getActivePlayer(serverName);
        player.dices = dices;
        player.movesLeft--;
        let dice = [];
        for (let dice1 of player.dices) {
            dice.push(dice1.dice);
        }
        player.pointsFieldTMP = this.calculateSetPointsField(dice, player);
    } //finish
    calculateSetPointsField(dices, player) {
        let setPoints = {
            ones: 0,
            twos: 0,
            threes: 0,
            fours: 0,
            fives: 0,
            sixes: 0,
            fullHouse: 0,
            street: 0,
            poker: 0,
            grande: 0,
            doubleGrande: 0,
            sum: 0,
        };
        let diceCounts = [0, 0, 0, 0, 0, 0];
        for (const dice of dices) {
            diceCounts[dice]++;
        }
        const uniqueDiceCount = diceCounts.filter(count => count > 0).length;
        // Ones
        if (diceCounts[game_1.Dice.one] > 0) {
            setPoints.ones = diceCounts[game_1.Dice.one];
        }
        // Twos
        if (diceCounts[game_1.Dice.two] > 0) {
            setPoints.twos = diceCounts[game_1.Dice.two] * 2;
        }
        // Threes
        if (diceCounts[game_1.Dice.three] > 0) {
            setPoints.threes = diceCounts[game_1.Dice.three] * 3;
        }
        // Fours
        if (diceCounts[game_1.Dice.four] > 0) {
            setPoints.fours = diceCounts[game_1.Dice.four] * 4;
        }
        // Fives
        if (diceCounts[game_1.Dice.five] > 0) {
            setPoints.fives = diceCounts[game_1.Dice.five] * 5;
        }
        // Sixes
        if (diceCounts[game_1.Dice.six] > 0) {
            setPoints.sixes = diceCounts[game_1.Dice.six] * 6;
        }
        let firstMove = true;
        for (let dice of player.dices) {
            if (!dice.change)
                firstMove = false;
        }
        // Full house
        if (uniqueDiceCount === 2 && diceCounts.some(count => count === 2) && diceCounts.some(count => count === 3)) {
            firstMove ? setPoints.fullHouse = 25 : setPoints.fullHouse = 20;
        }
        // Street
        if (uniqueDiceCount === 5 && (dices.includes(game_1.Dice.one) && dices.includes(game_1.Dice.two) && dices.includes(game_1.Dice.three) && dices.includes(game_1.Dice.four) && dices.includes(game_1.Dice.five) || dices.includes(game_1.Dice.two) && dices.includes(game_1.Dice.three) && dices.includes(game_1.Dice.four) && dices.includes(game_1.Dice.five) && dices.includes(game_1.Dice.six))) {
            firstMove ? setPoints.street = 35 : setPoints.street = 30;
        }
        // Poker
        if (uniqueDiceCount === 2 && (diceCounts.some(count => count >= 4))) {
            firstMove ? setPoints.poker = 45 : setPoints.poker = 40;
        }
        // Grande
        if (uniqueDiceCount === 1 && (diceCounts.some(count => count === 5))) {
            setPoints.grande = 50;
        }
        // Double Grande
        if (uniqueDiceCount === 1 && (diceCounts.some(count => count === 5))) {
            firstMove ? setPoints.doubleGrande = 100 : setPoints.doubleGrande = 0;
        }
        return setPoints;
    } //finish
    disconnect(playerName, serverName) {
        let player = this.getPlayer(serverName, playerName);
        let game = this.game.get(serverName);
        game.numberOfPlayersWhoLeft++;
        player.isOnline = false;
        if (game.state == game_1.GameState.joining || game.numberOfPlayersWhoLeft == game.numberOfPlayersJoined) {
            this.game.delete(serverName);
        }
    } //finish
    getRandomDice() {
        return this.dices[Math.floor(Math.random() * 6)];
    } //finish
    getGame(serverName) {
        return this.game.has(serverName) ? this.game.get(serverName) : game_1.GameNotExists.gameNotExistsError;
    } //finish
}
exports.DicepokerStore = DicepokerStore;
