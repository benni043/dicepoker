import {ChangeDiceObject, Dice, Game, GameNotExists, GameState, PointsField, StandardGameData, ThrowRes} from "../game";
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

    rejoin(serverName: number, playerName: string, ws: Socket) {
        let game = this.game.get(serverName)!;
        let player = game.player1.playerName == playerName ? game.player1 : game.player2;

        player.isOnline = true;
        game.numberOfPlayersWhoLeft--;
        player.socket = ws;
    }

    setDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: number): ThrowRes {
        let newDices = []
        let holdDices = []

        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        for (let receiveDice of receiveDices) {
            if (receiveDice.change) {
                newDices.push(this.getRandomDice());
            } else {
                holdDices.push(receiveDice.dice);
            }
        }

        this.setPlayerSettings(serverName, playerName, [...newDices, ...holdDices]);

        return {newDices: {dices: newDices, holdDices: holdDices}, moves: player.movesLeft};
    } //finish

    setGameEnd(serverName: number) {
        this.game.get(serverName)!.state = GameState.finished;
    } //finish

    setField(playerName: string, serverName: number, field: string): void {
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

        if (player.movesLeft == 0) {
            player.isOnMove = false;
            player.dices = [];

            opponent.isOnMove = true;
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
        }
    } //finish

    getPlayersField(playerName: string, serverName: number): Map<string, PointsField> {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;

        let map: Map<string, PointsField> = new Map();

        map.set(player.playerName, player.pointsFieldTMP);

        return map;
    } //finish

    getSumField(playerName: string, serverName: number): Map<string, PointsField> {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let opponent = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player2 : this.game.get(serverName)!.player1;

        let map: Map<string, PointsField> = new Map();

        map.set(player.playerName, player.pointsField);
        map.set(opponent.playerName, opponent.pointsField);

        return map;
    } //finish

    private setPlayerSettings(serverName: number, playerName: string, newDices: Dice[]): void {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let opponent = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player2 : this.game.get(serverName)!.player1;

        player.dices = newDices;
        player.movesLeft--;



        player.pointsFieldTMP = this.calculateSetPointsField(newDices);
    } //finish

    private calculateSetPointsField(dices: Dice[]): PointsField {
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
    } //finish

    disconnect(playerName: string, serverName: number) {
        let player = this.game.get(serverName)!.player1.playerName == playerName ? this.game.get(serverName)!.player1 : this.game.get(serverName)!.player2;
        let game = this.game.get(serverName)!;

        game.numberOfPlayersWhoLeft++;
        player.isOnline = false;

        if(game.state == GameState.joining || game.numberOfPlayersWhoLeft == 2) {
            this.game.delete(serverName);
        }
    } //finish



    dices: Dice[] = [Dice.one, Dice.two, Dice.three, Dice.four, Dice.five, Dice.six];

    getRandomDice(): Dice {
        return this.dices[Math.floor(Math.random() * 6)];
    } //finish

    getGame(serverName: number): Game | GameNotExists {
        return this.game.has(serverName) ? this.game.get(serverName)! : GameNotExists.gameNotExistsError;
    } //finish

}