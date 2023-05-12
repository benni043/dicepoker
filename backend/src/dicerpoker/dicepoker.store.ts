import {
    ChangeDiceObject,
    Dice,
    Game,
    GameState,
    Player,
    PointsField,
    ReturnEnum,
    StandardGameData,
    Throw
} from "../game";
import {Socket} from "socket.io";

export class DicepokerStore {

    private game: Map<number, Game> = new Map();

    join(standardGameData: StandardGameData, ws: Socket): void {
        if (!this.game.has(standardGameData.serverName)) {
            this.game.set(standardGameData.serverName, {
                player1: {
                    playerName: standardGameData.playerName,
                    isOnline: true,
                    dices: [],
                    movesLeft: 3,
                    points: 0,
                    socket: ws,
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
                },
                player2: {
                    playerName: "",
                    isOnline: false,
                    dices: [],
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
                },
                state: GameState.joining,
                numberOfPlayersWhoLeft: 0
            });
        } else {
            this.game.get(standardGameData.serverName)!.state = GameState.running;

            this.game.get(standardGameData.serverName)!.player1.isOnMove = true;

            this.game.get(standardGameData.serverName)!.player2.playerName = standardGameData.playerName;
            this.game.get(standardGameData.serverName)!.player2.isOnline = true;
            this.game.get(standardGameData.serverName)!.player2.socket = ws;
        }
    }

    checkIfFieldFree(playerName: string, serverName: number, field: string): boolean {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        switch (field) {
            case "ones": {
                if (player.pointsField.ones != -1) return false;
                break
            }
            case "twos": {
                if (player.pointsField.twos != -1) return false;
                break
            }
            case "threes": {
                if (player.pointsField.threes != -1) return false;
                break
            }
            case "fours": {
                if (player.pointsField.fours != -1) return false;
                break
            }
            case "fives": {
                if (player.pointsField.fives != -1) return false;
                break
            }
            case "sixes": {
                if (player.pointsField.sixes != -1) return false;
                break
            }
            case "fullHouse": {
                if (player.pointsField.fullHouse != -1) return false;
                break
            }
            case "street": {
                if (player.pointsField.street != -1) return false;
                break
            }
            case "poker": {
                if (player.pointsField.poker != -1) return false;
                break
            }
            case "grande": {
                if (player.pointsField.grande != -1) return false;
                break
            }
            case "doubleGrande": {
                if (player.pointsField.doubleGrande != -1) return false;
                break
            }
        }
        return true;
    }

    setPointsToGameView(playerName: string, serverName: number, field: string): void {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let opponent = this.game.get(serverName)!.player1.playerName != playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

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

        if (this.checkIfGameEnd(player.pointsField) && this.checkIfGameEnd(opponent.pointsField)) this.game.get(serverName)!.state = GameState.finished

        //muss noch besser
        //am anfang mitt allen würfeln
        //feld am anfang anzeigen
        //mehr spieler
        //mehr spalten
        //rejoin
        //delete game
    }

    checkIfGameEnd(pointsField: PointsField) {
        for (const [key, value] of Object.entries(pointsField)) {
            if (value === -1) {
                return false;
            }
        }
        return true;
    }

    getSumField(playerName: string, serverName: number): Map<string, PointsField> {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let opponent = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player2 : this.game.get(serverName)!.player1;

        let map: Map<string, PointsField> = new Map();

        map.set(player.playerName, player.pointsField);
        map.set(opponent.playerName, opponent.pointsField);

        player.isOnMove = false;
        player.movesLeft = 3;
        player.dices = [];
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

        opponent.isOnMove = true;

        return map;
    }

    getPlayersField(playerName: string, serverName: number): Map<string, PointsField> {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        let map: Map<string, PointsField> = new Map();

        map.set(player.playerName, player.pointsFieldTMP);

        return map;
    }

    turnChange(playerName: string, serverName: number) {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let opponent = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player2 : this.game.get(serverName)!.player1;

        if (player.isOnMove) return player.playerName;
        else return opponent.playerName;
    }

    getNewDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: number): Throw {
        let newDices: Dice[] = []

        for (let receiveDice of receiveDices) {
            if (receiveDice.change) {
                newDices.push(this.getRandomDice());
            } else {
                newDices.push(receiveDice.dice);
            }
        }

        let response = this.setPlayerSettings(serverName, playerName, newDices);

        if (response) {
            return {returnEnum: ReturnEnum.throwSuccess, dices: newDices, end: true, playerName: playerName};
        } else {
            return {returnEnum: ReturnEnum.throwSuccess, dices: newDices, end: false, playerName: playerName};
        }
    }

    setPlayerSettings(serverName: number, playerName: string, newDices: Dice[]): boolean {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        player.dices = newDices;
        player.movesLeft--;

        player.pointsFieldTMP = this.calculateSetPointsField(newDices);

        return this.checkIfPlayersLastMove(serverName, playerName);
    }

    gameEnd(serverName: number, playerName: string): boolean {
        let game = this.game.get(serverName);

        return game!.state == GameState.finished;
    }

    calculateSetPointsField(dices: Dice[]): PointsField {
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
        if (diceCounts[Dice.one] > 0) {
            setPoints.ones = diceCounts[Dice.one];
        }

        // Twos
        if (diceCounts[Dice.two] > 0) {
            setPoints.twos = diceCounts[Dice.two] * 2;
        }

        // Threes
        if (diceCounts[Dice.three] > 0) {
            setPoints.threes = diceCounts[Dice.three] * 3;
        }

        // Fours
        if (diceCounts[Dice.four] > 0) {
            setPoints.fours = diceCounts[Dice.four] * 4;
        }

        // Fives
        if (diceCounts[Dice.five] > 0) {
            setPoints.fives = diceCounts[Dice.five] * 5;
        }

        // Sixes
        if (diceCounts[Dice.six] > 0) {
            setPoints.sixes = diceCounts[Dice.six] * 6;
        }

        // Full house
        if (uniqueDiceCount === 2 && diceCounts.some(count => count === 2) && diceCounts.some(count => count === 3)) {
            setPoints.fullHouse = 20;
        }

        // Street
        if (uniqueDiceCount === 5 && (dices.includes(Dice.one) && dices.includes(Dice.two) && dices.includes(Dice.three) && dices.includes(Dice.four) && dices.includes(Dice.five) || dices.includes(Dice.two) && dices.includes(Dice.three) && dices.includes(Dice.four) && dices.includes(Dice.five) && dices.includes(Dice.six))) {
            setPoints.street = 30;
        }

        // Poker
        if (uniqueDiceCount === 2 && (diceCounts.some(count => count === 4))) {
            setPoints.poker = 40;
        }

        // Grande
        if (uniqueDiceCount === 1 && (diceCounts.some(count => count === 5))) {
            setPoints.grande = 50;
        }

        // Double Grande
        if (uniqueDiceCount === 1 && (diceCounts.some(count => count === 5))) {
            setPoints.doubleGrande = 100;
        }

        return setPoints;
    }



    //custom check functions

    dices: Dice[] = [Dice.one, Dice.two, Dice.three, Dice.four, Dice.five, Dice.six];

    getRandomDice(): Dice {
        return this.dices[Math.floor(Math.random() * 6)];
    }

    getGameState(serverName: number): GameState {
        if (this.game.has(serverName)) {
            return this.game.get(serverName)!.state
        } else {
            return GameState.unknown;
        }
    }

    checkIfPlayerExists(serverName: number, playerName: string): boolean {
        if (!this.game.has(serverName)) return false;

        return this.game.get(serverName)!.player1.playerName == playerName || this.game.get(serverName)!.player2.playerName == playerName;
    }

    checkIfPlayerIsOnTurn(serverName: number, playerName: string): boolean {
        if (!this.game.has(serverName)) return false;

        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        return player.isOnMove;
    }

    checkIfPlayersLastMove(serverName: number, playerName: string): boolean {
        if (!this.game.has(serverName)) return false;

        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        return player.movesLeft == 0;
    }

    getPlayers(serverName: number, playerName: string): Player[] {
        if (!this.game.has(serverName)) return [];

        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let opponent = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player2 : this.game.get(serverName)!.player1;

        return [player, opponent];
    }
}