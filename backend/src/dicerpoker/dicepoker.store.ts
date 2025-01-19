import {
    ChangeDiceObject,
    CreateData,
    Dice,
    Game,
    GameNotExists,
    GameState,
    Player,
    PointsField,
    StandardGameData,
    ThrowRes
} from "../game";
import {Socket} from "socket.io";

export class DicepokerStore {

    private static instance: DicepokerStore;

    private game: Map<string, Game> = new Map();

    public static getInstance(): DicepokerStore {
        if (!DicepokerStore.instance) {
            DicepokerStore.instance = new DicepokerStore();
        }
        return DicepokerStore.instance;
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

    create(createData: CreateData) {
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
            }

            players.push(player);
        }

        this.game.set(createData.serverName, {
            players: players,
            state: GameState.joining,
            numberOfPlayersJoined: 0,
            numberOfPlayersWhoLeft: 0
        })
    }

    join(standardGameData: StandardGameData, ws: Socket): void {
        let game = this.game.get(standardGameData.serverName)!;
        game.numberOfPlayersJoined++;

        game.players[game.numberOfPlayersJoined - 1].playerName = standardGameData.playerName;
        game.players[game.numberOfPlayersJoined - 1].isOnline = true
        game.players[game.numberOfPlayersJoined - 1].socket = ws;

        if (game.numberOfPlayersJoined == game.players.length) {
            game.state = GameState.running;
            game.players[0].isOnMove = true;
        }
    }

    getPlayer(serverName: string, playerName: string) {
        let game = this.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return null
        else {
            let players = this.getPlayers(serverName);

            for (let player of players) {
                if (player.playerName == playerName) {
                    return player;
                }
            }
        }
    }

    getPlayers(serverName: string): Player[] {
        let game = this.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return []
        else {
            return game.players;
        }
    } //finish

    rejoin(serverName: string, playerName: string, ws: Socket) {
        let game = this.game.get(serverName)!;
        let player = this.getPlayer(serverName, playerName)!;

        player.isOnline = true;
        game.numberOfPlayersWhoLeft--;
        player.socket = ws;
    }

    changeDices(serverName: string, playerName: string, dices: ChangeDiceObject[]) {
        let player = this.getPlayer(serverName, playerName)!;

        player.dices = dices;
    }

    setDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: string): ThrowRes {
        let newDices: ChangeDiceObject[] = [];

        let player = this.getPlayer(serverName, playerName)!;

        for (let receiveDice of receiveDices) {
            if (receiveDice.change) {
                newDices.push({dice: this.getRandomDice(), change: true} as ChangeDiceObject);
            } else {
                newDices.push({dice: receiveDice.dice, change: false} as ChangeDiceObject);
            }
        }

        this.setPlayerSettings(serverName, playerName, newDices);

        return {newDices: newDices, moves: player.movesLeft};
    } //finish

    setGameEnd(serverName: string) {
        this.game.get(serverName)!.state = GameState.finished;
    } //finish

    getNextValue(players: Player[], player: Player) {
        const currentIndex = players.indexOf(player);
        const nextIndex = (currentIndex + 1) % players.length;
        return players[nextIndex];
    }

    setField(playerName: string, serverName: string, field: string): void {
        let player = this.getPlayer(serverName, playerName)!;
        let opponent = this.getNextValue(this.getPlayers(serverName), player);

        switch (field) {
            case "ones": {
                player.pointsField.ones = player.pointsFieldTMP.ones;
                player.points += player.pointsField.ones;
                break
            }
            case "twos": {
                player.pointsField.twos = player.pointsFieldTMP.twos;
                player.points += player.pointsField.twos;
                break
            }
            case "threes": {
                player.pointsField.threes = player.pointsFieldTMP.threes;
                player.points += player.pointsField.threes;
                break
            }
            case "fours": {
                player.pointsField.fours = player.pointsFieldTMP.fours;
                player.points += player.pointsField.fours;
                break
            }
            case "fives": {
                player.pointsField.fives = player.pointsFieldTMP.fives;
                player.points += player.pointsField.fives;
                break
            }
            case "sixes": {
                player.pointsField.sixes = player.pointsFieldTMP.sixes;
                player.points += player.pointsField.sixes;
                break
            }
            case "fullHouse": {
                player.pointsField.fullHouse = player.pointsFieldTMP.fullHouse;
                player.points += player.pointsField.fullHouse;
                break
            }
            case "street": {
                player.pointsField.street = player.pointsFieldTMP.street;
                player.points += player.pointsField.street;
                break
            }
            case "poker": {
                player.pointsField.poker = player.pointsFieldTMP.poker;
                player.points += player.pointsField.poker;
                break
            }
            case "grande": {
                player.pointsField.grande = player.pointsFieldTMP.grande;
                player.points += player.pointsField.grande;
                break
            }
            case "doubleGrande": {
                player.pointsField.doubleGrande = player.pointsFieldTMP.doubleGrande;
                player.points += player.pointsField.doubleGrande;
                break
            }
        }

        player.pointsField.sum = player.points;

        player.isOnMove = false;
        player.dices = [{dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true}];

        opponent.isOnMove = true;
        opponent.dices = [{dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true},
            {dice: Dice.one, change: true}];

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
        }
    } //finish

    getActivePlayer(serverName: string) {
        let game = this.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return undefined;
        else {
            let players = this.getPlayers(serverName);

            for (let player of players) {
                if (player.isOnMove) {
                    return player;
                }
            }
        }
    }

    getPlayersField(playerName: string, serverName: string): Map<string, PointsField> {
        let player = this.getActivePlayer(serverName)!;

        let map: Map<string, PointsField> = new Map();

        map.set(player.playerName, player.pointsFieldTMP);

        return map;
    } //finish

    getSumField(playerName: string, serverName: string): Map<string, PointsField> {
        let players = this.getPlayers(serverName);

        let map: Map<string, PointsField> = new Map();

        for (let player of players) {
            map.set(player.playerName, player.pointsField)
        }

        return map;
    } //finish

    private setPlayerSettings(serverName: string, playerName: string, dices: ChangeDiceObject[]): void {
        let player = this.getActivePlayer(serverName)!;

        player.dices = dices;
        player.movesLeft--;

        let dice = []
        for (let dice1 of player.dices) {
            dice.push(dice1.dice);
        }

        player.pointsFieldTMP = this.calculateSetPointsField(dice, player);
    } //finish

    private calculateSetPointsField(dices: Dice[], player: Player): PointsField {
        let setPoints: PointsField = {
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

        let diceCounts: number[] = [0, 0, 0, 0, 0, 0];
        for (const dice of dices) {
            diceCounts[dice]++;
        }

        const uniqueDiceCount = diceCounts.filter(count => count > 0).length;

        // Ones
        if (diceCounts[Dice.one] > 0) setPoints.ones = diceCounts[Dice.one];

        // Twos
        if (diceCounts[Dice.two] > 0) setPoints.twos = diceCounts[Dice.two] * 2;

        // Threes
        if (diceCounts[Dice.three] > 0) setPoints.threes = diceCounts[Dice.three] * 3;

        // Fours
        if (diceCounts[Dice.four] > 0) setPoints.fours = diceCounts[Dice.four] * 4;

        // Fives
        if (diceCounts[Dice.five] > 0) setPoints.fives = diceCounts[Dice.five] * 5;

        // Sixes
        if (diceCounts[Dice.six] > 0) setPoints.sixes = diceCounts[Dice.six] * 6;

        let firstMove = true;
        for (let dice of player.dices) {
            if (!dice.change) firstMove = false;
        }

        // Full house
        if (uniqueDiceCount === 2 && diceCounts.some(count => count === 2) && diceCounts.some(count => count === 3)) firstMove ? setPoints.fullHouse = 25 : setPoints.fullHouse = 20;

        // Street
        if (uniqueDiceCount === 5 && (dices.includes(Dice.one) && dices.includes(Dice.two) && dices.includes(Dice.three) && dices.includes(Dice.four) && dices.includes(Dice.five) || dices.includes(Dice.two) && dices.includes(Dice.three) && dices.includes(Dice.four) && dices.includes(Dice.five) && dices.includes(Dice.six)))
            firstMove ? setPoints.street = 35 : setPoints.street = 30;

        // Poker
        if (uniqueDiceCount === 2 && (diceCounts.some(count => count >= 4))) firstMove ? setPoints.poker = 45 : setPoints.poker = 40;

        // Grande
        if (uniqueDiceCount === 1 && (diceCounts.some(count => count === 5))) setPoints.grande = 50;

        // Double Grande
        if (uniqueDiceCount === 1 && (diceCounts.some(count => count === 5))) firstMove ? setPoints.doubleGrande = 100 : setPoints.doubleGrande = 0;

        return setPoints;
    } //finish

    disconnect(playerName: string, serverName: string) {
        let player = this.getPlayer(serverName, playerName)!;
        let game = this.game.get(serverName)!;

        game.numberOfPlayersWhoLeft++;
        player.isOnline = false;

        if (game.state == GameState.joining || game.numberOfPlayersWhoLeft == game.numberOfPlayersJoined) this.game.delete(serverName);
    } //finish


    dices: Dice[] = [Dice.one, Dice.two, Dice.three, Dice.four, Dice.five, Dice.six];

    getRandomDice(): Dice {
        return this.dices[Math.floor(Math.random() * 6)];
    } //finish

    getGame(serverName: string): Game | GameNotExists {
        return this.game.has(serverName) ? this.game.get(serverName)! : GameNotExists.gameNotExistsError;
    } //finish

}