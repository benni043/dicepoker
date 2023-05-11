import {DicepokerStore} from "./dicepoker.store";
import {
    ChangeDiceObject,
    GameState,
    JoinReturn,
    PlayerSockets,
    PointsField,
    ReturnEnum,
    StandardGameData,
    Throw
} from "../game";
import {Socket} from "socket.io";

export class DicepokerService {

    private dicerpokerStore: DicepokerStore = new DicepokerStore();

    join(standardGameData: StandardGameData, ws: Socket): JoinReturn {
        if (this.dicerpokerStore.getGameState(standardGameData.serverName) == GameState.running) {
            return {returnEnum: ReturnEnum.gameFullErr, response: null};
        }

        if (this.dicerpokerStore.checkIfPlayerExists(standardGameData.serverName, standardGameData.playerName)) {
            return {returnEnum: ReturnEnum.illegalPlayerErr, response: null};
        }

        let response: PlayerSockets = this.dicerpokerStore.join(standardGameData, ws);
        return {returnEnum: ReturnEnum.joinSuccess, response: response};
    }

    throw(receiveDices: ChangeDiceObject[], playerName: string, serverName: number): Throw | ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (this.dicerpokerStore.checkIfPlayersTurnIsOver(serverName, playerName)) {
            return ReturnEnum.turnIsOver
        }

        return this.dicerpokerStore.changeDices(receiveDices, playerName, serverName);
    }

    setPoint(playerName: string, serverName: number, field: string): ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.dicerpokerStore.checkIfPlayersTurnIsOver(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        this.dicerpokerStore.setPointsToGameView(playerName, serverName, field);
        return ReturnEnum.setSuccess;
    }

    getPlayersField(playerName: string, serverName: number): Map<string, PointsField> | ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.dicerpokerStore.checkIfPlayersTurnIsOver(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        return this.dicerpokerStore.getPlayersField(playerName, serverName);
    }

    getSumField(playerName: string, serverName: number): Map<string, PointsField> | ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.dicerpokerStore.checkIfPlayersTurnIsOver(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        return this.dicerpokerStore.getSumField(playerName, serverName);
    }

    turnChange(playerName: string, serverName: number): string | ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.dicerpokerStore.checkIfPlayersTurnIsOver(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        console.log(1)
        return this.dicerpokerStore.turnChange(playerName, serverName);
    }

}