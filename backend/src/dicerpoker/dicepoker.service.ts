import {DicepokerStore} from "./dicepoker.store";
import {
    ChangeDiceObject,
    Dice,
    GameNotExists,
    GameState,
    GetError,
    Player,
    PointsField,
    RejoinData,
    RejoinType,
    ReturnEnum,
    SetError, SetSuccess,
    StandardGameData,
    ThrowRes
} from "../game";
import {Socket} from "socket.io";

export class DicepokerService {

    private dicerpokerStore: DicepokerStore = new DicepokerStore();

    routerJoin(standardGameData: StandardGameData, ws: Socket): GameNotExists | RejoinData | ReturnEnum {
        if (this.getGameState(standardGameData.serverName) == GameState.running) {
            let player = this.getPlayer(standardGameData.serverName, standardGameData.playerName)!;
            if (!player.isOnline && player.playerName == standardGameData.playerName) {
                this.dicerpokerStore.rejoin(standardGameData.serverName, standardGameData.playerName, ws);

                return this.getRejoinData(standardGameData.serverName, standardGameData.playerName);
            } else {
                return ReturnEnum.gameFullErr
            }
        }

        if (this.checkIfPlayerExists(standardGameData.serverName, standardGameData.playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        this.dicerpokerStore.join(standardGameData, ws);
        return ReturnEnum.joinSuccess
    }

    getRejoinData(serverName: number, playerName: string): GameNotExists | RejoinData {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return GameNotExists.gameNotExistsError;
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            let opponent = game.player1.playerName != playerName ? game.player1 : game.player2;

            if (game.state == GameState.finished) {
                return {
                    type: RejoinType.end,
                    dices: player.dices,
                    holdDices: [],
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumF(serverName, playerName).entries())),
                    actPlayer: player.points > opponent.points ? player.playerName : opponent.playerName,
                    moves: 0,
                }
            }
            if (player.isOnMove && player.movesLeft > 0) {
                return {
                    type: RejoinType.dice,
                    dices: player.dices,
                    holdDices: [],
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumF(serverName, playerName).entries())),
                    actPlayer: player.isOnMove ? player.playerName : opponent.playerName,
                    moves: player.isOnMove ? player.movesLeft : opponent.movesLeft,
                };
            } else if (player.isOnMove && player.movesLeft == 0) {
                return {
                    type: RejoinType.playerField,
                    dices: player.dices,
                    holdDices: [],
                    playerField: JSON.stringify(Array.from(this.dicerpokerStore.getPlayersField(playerName, serverName).entries())),
                    sumField: JSON.stringify(Array.from(this.getSumF(serverName, playerName).entries())),
                    actPlayer: player.isOnMove ? player.playerName : opponent.playerName,
                    moves: player.isOnMove ? player.movesLeft : opponent.movesLeft,
                };
            } else {
                return {
                    type: RejoinType.sumField,
                    dices: opponent.dices,
                    holdDices: [],
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumF(serverName, playerName).entries())),
                    actPlayer: player.isOnMove ? player.playerName : opponent.playerName,
                    moves: player.isOnMove ? player.movesLeft : opponent.movesLeft,
                };
            }
        }
    }

    routerSetDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: number): ThrowRes | SetError {
        if (this.getGameState(serverName) == GameState.finished) {
            return SetError.gameFinished;
        }

        if (this.getGameState(serverName) == GameState.joining) {
            return SetError.gameNotStarted
        }

        if (this.getGameState(serverName) == GameState.unknown) {
            return SetError.gameNotExists
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return SetError.unknownPlayer
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return SetError.wrongPlayer
        }

        if (this.getPlayerMoves(serverName, playerName) == 3) {
            let dices = [
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true},
                {dice: Dice.one, change: true}];

            return this.dicerpokerStore.setDices(dices, playerName, serverName);
        } else {
            return this.dicerpokerStore.setDices(receiveDices, playerName, serverName);
        }
    } //finish

    routerSetField(playerName: string, serverName: number, field: string): SetError | SetSuccess {
        if (this.getGameState(serverName) == GameState.finished) {
            return SetError.gameFinished;
        }

        if (this.getGameState(serverName) == GameState.joining) {
            return SetError.gameNotStarted
        }

        if (this.getGameState(serverName) == GameState.unknown) {
            return SetError.gameNotExists
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return SetError.unknownPlayer
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return SetError.wrongPlayer
        }

        if (!this.checkIfFieldFree(playerName, serverName, field)) {
            return SetError.fieldFull;
        }

        this.dicerpokerStore.setField(playerName, serverName, field);

        let players = this.getPlayers(serverName);
        let end = this.checkIfGameEnd(players);

        if (!end) {
            return SetSuccess.update;
        } else {
            this.dicerpokerStore.setGameEnd(serverName);
            return SetSuccess.end;
        }
    } //finish

    routerGetPlayersField(playerName: string, serverName: number): Map<string, PointsField> | SetError {
        if (this.getGameState(serverName) == GameState.finished) {
            return SetError.gameFinished;
        }

        if (this.getGameState(serverName) == GameState.joining) {
            return SetError.gameNotStarted
        }

        if (this.getGameState(serverName) == GameState.unknown) {
            return SetError.gameNotExists
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return SetError.unknownPlayer
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return SetError.wrongPlayer
        }

        return this.dicerpokerStore.getPlayersField(playerName, serverName);
    } //finish

    routerGetSumField(playerName: string, serverName: number): Map<string, PointsField> | GetError {
        if (this.getGameState(serverName) == GameState.joining || this.getGameState(serverName) == GameState.unknown) {
            return GetError.gameNotExists;
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return GetError.unknownPlayer
        }

        return this.dicerpokerStore.getSumField(playerName, serverName);
    } //finish

    routerGetActivePlayer(playerName: string, serverName: number): string | GetError {
        if (this.getGameState(serverName) == GameState.joining || this.getGameState(serverName) == GameState.unknown) {
            return GetError.gameNotExists;
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return GetError.unknownPlayer
        }

        let players = this.getPlayers(serverName);
        let activePlayer = "";

        for (let player of players) {
            if (player.isOnMove) {
                activePlayer = player.playerName;
                break
            }
        }

        return activePlayer;
    } //finish

    routerDisconnect(playerName: string, serverName: number): null | GetError {
        if (this.getGameState(serverName) == GameState.joining || this.getGameState(serverName) == GameState.running) {
            this.dicerpokerStore.disconnect(playerName, serverName);
            return null;
        } else {
            return GetError.gameNotExists
        }
    } //finish


    //CHECK-FUNCTIONS
    checkIfPlayerExists(serverName: number, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else return game.player1.playerName == playerName || game.player2.playerName == playerName;
    } //finish
    checkIfPlayerIsOnTurn(serverName: number, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;

            return player.isOnMove;
        }
    } //finish
    checkIfFieldFree(playerName: string, serverName: number, field: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false

        let player = game.player1.playerName == playerName ? game.player1 : game.player2;

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
    checkIfGameEnd(players: Player[]) {
        for (let player of players) {
            for (const [key, value] of Object.entries(player.pointsField)) {
                if (value === -1) {
                    return false;
                }
            }
        }
        return true
    } //finish


    //GET-FUNCTIONS
    getGameState(serverName: number): GameState {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return GameState.unknown
        else return game.state
    } //finish
    getPlayers(serverName: number): Player[] {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return []
        else {
            return [game.player1, game.player2]
        }
    } //finish
    getPlayer(serverName: number, playerName: string) {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return null
        else {
            return game.player1.playerName == playerName ? game.player1 : game.player2;
        }
    } //finish
    getPlayerMoves(serverName: number, playerName: string): number {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return 0
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;

            return player.movesLeft;
        }
    } //finish
    getSumF(serverName: number, playerName: string) {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return new Map<string, PointsField>()
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            let opponent = game.player1.playerName != playerName ? game.player1 : game.player2;

            let map: Map<string, PointsField> = new Map();

            map.set(player.playerName, player.pointsField);
            map.set(opponent.playerName, opponent.pointsField);

            return map;
        }
    } //check
    getWinner(serverName: number, playerName: string): string {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return ""
        else {
            let winner = "";
            let points = -1;

            let players = this.getPlayers(serverName);

            for (let player of players) {
                if (player.points > points) {
                    winner = player.playerName;
                    points = player.points
                }
            }

            return winner;
        }
    }
}