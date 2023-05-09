import {DicepokerStore} from "./dicepoker.store";
import {
    End,
    GameState,
    JoinResponseData,
    JoinReturn,
    ReceiveDice,
    ReturnEnum,
    SetPointsReturn,
    StandardGameData,
    ThrowReturn
} from "../../../utils/game";
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

        let response: JoinResponseData = this.dicerpokerStore.join(standardGameData, ws);
        return {returnEnum: ReturnEnum.joinSuccess, response: response};
    }

    throw(receiveDices: ReceiveDice[], playerName: string, serverName: number): ThrowReturn {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return {returnEnum: ReturnEnum.gameNotStartedErr, response: null, pointsField: null};
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return {returnEnum: ReturnEnum.illegalPlayerErr, response: null, pointsField: null};
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return {returnEnum: ReturnEnum.playerNotOnTurnErr, response: null, pointsField: null};
        }

        let response: End = this.dicerpokerStore.changeDices(receiveDices, playerName, serverName);

        if (response.turnEnd == null) {
            return {returnEnum: ReturnEnum.throwSuccess, response: response.dices, pointsField: null}
        } else {
            return {
                returnEnum: ReturnEnum.throwSuccessEnd,
                response: response.dices,
                pointsField: response.turnEnd.pointsField
            }
        }
    }

    setPoints(playerName: string, serverName: number, field: string): SetPointsReturn {
        if (this.dicerpokerStore.getGameState(serverName) != GameState.running) {
            return {returnEnum: ReturnEnum.gameNotStartedErr, points: -1};
        }

        if (!this.dicerpokerStore.checkIfPlayerExists(serverName, playerName)) {
            return {returnEnum: ReturnEnum.illegalPlayerErr, points: -1};
        }

        if (!this.dicerpokerStore.checkIfPlayerIsOnTurn(serverName, playerName)) {
            return {returnEnum: ReturnEnum.playerNotOnTurnErr, points: -1};
        }

        if(!this.dicerpokerStore.checkIfPlayersTurnIsOver(serverName, playerName)) {
            return {returnEnum: ReturnEnum.turnIsNotOver, points: -1};
        }

        return {
            returnEnum: ReturnEnum.setSuccess,
            points: this.dicerpokerStore.setPoints(playerName, serverName, field)
        };
    }

}