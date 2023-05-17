import {DicepokerStore} from "./dicepoker.store";
import {
    ChangeDiceObject,
    Dice,
    GameNotExists,
    GameState,
    Player,
    PointsField,
    ReturnEnum,
    StandardGameData,
    Throw
} from "../game";
import {Socket} from "socket.io";

export class DicepokerService {

    private dicerpokerStore: DicepokerStore = new DicepokerStore();

    join(standardGameData: StandardGameData, ws: Socket): ReturnEnum {
        if (this.getGameState(standardGameData.serverName) == GameState.running) {
            let player = this.getPlayer(standardGameData.serverName, standardGameData.playerName)!;
            if (!player.isOnline && player.playerName == standardGameData.playerName) {
                this.dicerpokerStore.rejoin(standardGameData.serverName, standardGameData.playerName, ws);
                return ReturnEnum.rejoin
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

    getRejoinData(standardGameData: StandardGameData) {

    }

    getNewDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: number): Throw {
        if (this.getGameState(serverName) != GameState.running) {
            return {returnEnum: ReturnEnum.gameNotStartedErr, dices: []}
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return {returnEnum: ReturnEnum.illegalPlayerErr, dices: []}
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return {returnEnum: ReturnEnum.playerNotOnTurnErr, dices: []}
        }

        if (this.checkIfPlayersLastMove(serverName, playerName)) {
            return {returnEnum: ReturnEnum.moves0, dices: []}
        }

        let res;

        if (this.getPlayerMoves(serverName, playerName) == 3) {
            let dices: ChangeDiceObject[] = [];
            dices.push({dice: Dice.one, change: true});
            dices.push({dice: Dice.one, change: true});
            dices.push({dice: Dice.one, change: true});
            dices.push({dice: Dice.one, change: true});
            dices.push({dice: Dice.one, change: true});

            res = this.dicerpokerStore.getNewDices(dices, playerName, serverName);
        } else {
            res = this.dicerpokerStore.getNewDices(receiveDices, playerName, serverName);
        }

        if (this.getPlayerMoves(serverName, playerName) == 0) {
            return {returnEnum: ReturnEnum.moves0, dices: res}
        }

        return {returnEnum: ReturnEnum.throwSuccess, dices: res};
    }

    setValueToPlayersField(playerName: string, serverName: number, field: string): ReturnEnum {
        if (this.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.checkIfPlayersLastMove(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        if (!this.checkIfFieldFree(playerName, serverName, field)) {
            return ReturnEnum.fieldAlreadySetErr;
        }

        this.dicerpokerStore.setPointsToGameView(playerName, serverName, field);

        let players = this.getPlayers(serverName, playerName);
        let end = this.checkIfGameEnd(players[0], players[1]);

        if (!end) {
            return ReturnEnum.setSuccess;
        } else {
            return ReturnEnum.gameEnd;
        }
    }

    getPlayersField(playerName: string, serverName: number): Map<string, PointsField> | ReturnEnum {
        if (this.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.checkIfPlayersLastMove(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        return this.dicerpokerStore.getPlayersField(playerName, serverName);
    }

    getSumField(playerName: string, serverName: number): Map<string, PointsField> | ReturnEnum {
        if (this.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.checkIfPlayersLastMove(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        return this.dicerpokerStore.getSumField(playerName, serverName);
    }

    turnChange(playerName: string, serverName: number): string | ReturnEnum {
        if (this.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        return this.dicerpokerStore.turnChange(playerName, serverName);
    }

    disconnect(playerName: string, serverName: number) {
        if (this.getGameState(serverName) == GameState.joining || this.getGameState(serverName) == GameState.running) {
            this.dicerpokerStore.disconnect(playerName, serverName);
        } else {
            return ReturnEnum.gameNotStartedErr
        }
    }


    //valid check funtions
    getGameState(serverName: number): GameState {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return GameState.unknown
        else return game.state
    }

    checkIfPlayerExists(serverName: number, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else return game.player1.playerName == playerName || game.player2.playerName == playerName;
    }

    checkIfPlayerIsOnTurn(serverName: number, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            return player.isOnMove;
        }
    }

    checkIfPlayersLastMove(serverName: number, playerName: string): boolean {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return false
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            return player.movesLeft == 0;
        }
    }

    getPlayers(serverName: number, playerName: string): Player[] {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return []
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            let opponent = game.player1.playerName != playerName ? game.player1 : game.player2;

            return [player, opponent]
        }
    }

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

    checkIfGameEnd(p1: Player, p2: Player) {
        let pointsField1 = p1.pointsField;
        let pointsField2 = p2.pointsField;

        for (const [key, value] of Object.entries(pointsField1)) {
            if (value === -1) {
                return false;
            }
        }
        for (const [key, value] of Object.entries(pointsField2)) {
            if (value === -1) {
                return false;
            }
        }

        return true;
    }

    getPlayerMoves(serverName: number, playerName: string): number {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return 0
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;

            return player.movesLeft;
        }
    }

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
    }

    getPlayer(serverName: number, playerName: string) {
        let game = this.dicerpokerStore.getGame(serverName);

        if (game == GameNotExists.gameNotExistsError) return null
        else {
            let player = game.player1.playerName == playerName ? game.player1 : game.player2;
            return player;
        }
    }

}