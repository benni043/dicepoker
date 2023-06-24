import {DicepokerStore} from "./dicepoker.store";
import {
    ChangeDiceObject,
    CreateData,
    Dice,
    GameNotExists,
    GameState,
    GetError,
    Player,
    PointsField,
    RejoinData,
    RejoinType,
    ReturnEnum,
    SetError,
    SetSuccess,
    StandardGameData,
    ThrowRes
} from "../game";
import {Socket} from "socket.io";

export class DicepokerService {

    private dicerpokerStore: DicepokerStore = new DicepokerStore();

    getAllGames() {
        return this.dicerpokerStore.getAllGames();
    }

    createGame(createData: CreateData) {
        let game = this.dicerpokerStore.gameGetter();

        if (!game.has(createData.serverName)) {
            this.dicerpokerStore.create(createData);
        }
    }

    routerJoin(standardGameData: StandardGameData, ws: Socket): GameNotExists | RejoinData | ReturnEnum {
        if (this.getGameState(standardGameData.serverName) == GameState.finished) {
            return ReturnEnum.gameEnd;
        }

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

        if (this.dicerpokerStore.gameGetter().has(standardGameData.serverName)) {
            this.dicerpokerStore.join(standardGameData, ws);
            return ReturnEnum.joinSuccess;
        }

        console.log("error")
        return ReturnEnum.gameFullErr//todo invalid
    }

    getRejoinData(serverName: string, playerName: string): GameNotExists | RejoinData {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return GameNotExists.gameNotExistsError;
        else {
            let me = this.getPlayer(serverName, playerName)!;
            let activePlayer = this.getActivePlayer(serverName)!;

            // let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            // let opponent = game.player1.playerName != playerName ? game.player1 : game.player2;

            if (me.isOnMove && me.movesLeft > 0) {
                return {
                    type: RejoinType.dice,
                    dices: me.dices,
                    holdDices: me.holdDices,
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumField(serverName, playerName).entries())),
                    actPlayer: me.playerName,
                    moves: me.movesLeft,
                };
            } else if (me.isOnMove && me.movesLeft == 0) {
                return {
                    type: RejoinType.playerField,
                    dices: me.dices,
                    holdDices: me.holdDices,
                    playerField: JSON.stringify(Array.from(this.dicerpokerStore.getPlayersField(playerName, serverName).entries())),
                    sumField: JSON.stringify(Array.from(this.getSumField(serverName, playerName).entries())),
                    actPlayer: me.playerName,
                    moves: me.movesLeft,
                };
            } else {
                return {
                    type: RejoinType.sumField,
                    dices: activePlayer.dices,
                    holdDices: activePlayer.holdDices,
                    playerField: null,
                    sumField: JSON.stringify(Array.from(this.getSumField(serverName, playerName).entries())),
                    actPlayer: activePlayer.playerName,
                    moves: activePlayer.movesLeft,
                };
            }
        }
    }

    routerSetDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: string): ThrowRes | SetError {
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

    routerSetField(playerName: string, serverName: string, field: string): SetError | SetSuccess {
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

    routerGetPlayersField(playerName: string, serverName: string): Map<string, PointsField> | SetError {
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

    routerGetSumField(playerName: string, serverName: string): Map<string, PointsField> | GetError {
        if (this.getGameState(serverName) == GameState.joining || this.getGameState(serverName) == GameState.unknown) {
            return GetError.gameNotExists;
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return GetError.unknownPlayer
        }

        return this.dicerpokerStore.getSumField(playerName, serverName);
    } //finish

    routerGetActivePlayer(playerName: string, serverName: string): string | GetError {
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

    routerDisconnect(playerName: string, serverName: string): null | GetError {
        if (this.getGameState(serverName) == GameState.joining || this.getGameState(serverName) == GameState.running || this.getGameState(serverName) == GameState.finished) {
            this.dicerpokerStore.disconnect(playerName, serverName);
            return null;
        } else {
            return GetError.gameNotExists
        }
    } //finish


    //CHECK-FUNCTIONS
    checkIfPlayerExists(serverName: string, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else {
            let players = this.getPlayers(serverName);

            for (let player of players) {
                if (player.playerName == playerName) return true;
            }
        }
        return false;
    } //finish
    checkIfPlayerIsOnTurn(serverName: string, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else {
            let players = this.getPlayers(serverName);

            for (let player of players) {
                if (player.isOnMove) return true;
            }
        }
        return false;
    } //finish
    checkIfFieldFree(playerName: string, serverName: string, field: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false

        let player = this.getActivePlayer(serverName)!;

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
    getGameState(serverName: string): GameState {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return GameState.unknown
        else return game.state
    } //finish
    getPlayers(serverName: string): Player[] {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return []
        else {
            return game.players;
        }
    } //finish
    getPlayer(serverName: string, playerName: string) {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return null
        else {
            let players = this.getPlayers(serverName);

            for (let player of players) {
                if (player.playerName == playerName) {
                    return player;
                }
            }
        }
    } //finish
    getPlayerMoves(serverName: string, playerName: string): number {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return 0
        else {
            let player = this.getPlayer(serverName, playerName)!;

            return player.movesLeft;
        }
    } //finish
    getSumField(serverName: string, playerName: string) {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return new Map<string, PointsField>()
        else {
            let players = this.getPlayers(serverName);

            let map: Map<string, PointsField> = new Map();

            for (let player of players) {
                map.set(player.playerName, player.pointsField)
            }

            return map;
        }
    } //check
    getWinner(serverName: string, playerName: string): string {
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

    getActivePlayer(serverName: string) {
        let game = this.dicerpokerStore.getGame(serverName);

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
}