import {DicepokerStore} from "./dicepoker.store";
import {ChangeDiceObject, GameState, Player, PointsField, ReturnEnum, StandardGameData, Throw} from "../game";
import {Socket} from "socket.io";

export class DicepokerService {

    private dicerpokerStore: DicepokerStore = new DicepokerStore();

    join(standardGameData: StandardGameData, ws: Socket): ReturnEnum {
        if (this.dicerpokerStore.getGameState(standardGameData.serverName) == GameState.running) {
            return ReturnEnum.gameFullErr
        }

        if (this.dicerpokerStore.checkIfPlayerExists(standardGameData.serverName, standardGameData.playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        this.dicerpokerStore.join(standardGameData, ws);
        return ReturnEnum.joinSuccess
    }

    getNewDices(receiveDices: ChangeDiceObject[], playerName: string, serverName: number): Throw | ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (this.dicerpokerStore.checkIfPlayersLastMove(serverName, playerName)) {
            return ReturnEnum.turnIsOver
        }

        return this.dicerpokerStore.getNewDices(receiveDices, playerName, serverName);
    }

    setValueToPlayersField(playerName: string, serverName: number, field: string): ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return ReturnEnum.illegalPlayerErr
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return ReturnEnum.playerNotOnTurnErr
        }

        if (!this.dicerpokerStore.checkIfPlayersLastMove(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        if (!this.dicerpokerStore.checkIfFieldFree(playerName, serverName, field)) {
            return ReturnEnum.fieldAlreadySetErr;
        }

        this.dicerpokerStore.setPointsToGameView(playerName, serverName, field);
        return ReturnEnum.setSuccess;
    }

    end(playerName: string, serverName: number) {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        let res = this.dicerpokerStore.gameEnd(serverName, playerName);

        if(!res) {
            return ReturnEnum.gameRunning;
        } else {
            return ReturnEnum.gameEnd;
        }

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

        if (!this.dicerpokerStore.checkIfPlayersLastMove(serverName, playerName)) {
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

        if (!this.dicerpokerStore.checkIfPlayersLastMove(serverName, playerName)) {
            return ReturnEnum.turnIsNotOver
        }

        return this.dicerpokerStore.getSumField(playerName, serverName);
    }

    turnChange(playerName: string, serverName: number): string | ReturnEnum {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return ReturnEnum.gameNotStartedErr
        }

        return this.dicerpokerStore.turnChange(playerName, serverName);
    }

    getPlayers(playerName: string, serverName: number): Player[] {
        return this.dicerpokerStore.getPlayers(serverName, playerName);
    }

}