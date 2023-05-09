import {Socket} from "socket.io";

export type Game = {
    player1: Player,
    player2: Player,
    state: GameState,
    numberOfPlayersWhoLeft: number
}

export type Player = {
    playerName: string,
    socket: Socket | undefined,
    dices: Dice[],
    points: number,
    movesLeft: number,
    isOnline: boolean,
    isOnMove: boolean,
    pointsField: SetPointsField,
    pointsFieldTMP: SetPointsField
}

export enum GameState {
    joining,
    running,
    finished,
    unknown
}

export enum Dice {
    one,
    two,
    three,
    four,
    five,
    six
}

export type ReceiveDice = {
    dice: Dice,
    change: boolean
}

export type JoinResponseData = {
    responseDicesPlayer1: Dice[],
    responseDicesPlayer2: Dice[],
    player1ws: Socket,
    player2ws: Socket,
}

export type StandardGameData = {
    serverName: number,
    playerName: string,
}

export type ThrowData = {
    standardGameData: StandardGameData,
    receiveDices: ReceiveDice[]
}

export enum ReturnEnum {
    gameFullErr,
    joinSuccess,
    illegalPlayerErr,
    gameNotStartedErr,
    throwSuccess,
    playerNotOnTurnErr,
    throwSuccessEnd,
    setSuccess,
    turnIsNotOver,
    turnIsOver
}

export type JoinReturn = {
    returnEnum: ReturnEnum,
    response: JoinResponseData | null
}

export type ThrowReturn = {
    returnEnum: ReturnEnum,
    response: Dice[] | null,
    sumField: Map<string, SetPointsField> | null,
}

export type SetPointsField = {
    ones: number,
    twos: number,
    threes: number,
    fours: number,
    fives: number,
    sixes: number,
    fullHouse: number,
    street: number,
    poker: number,
    grande: number,
    doubleGrande: number
}

export type TurnEnd = {
    sumField: Map<string, SetPointsField> | null,
    end: boolean;
}

export type End = {
    turnEnd: TurnEnd | null,
    dices: Dice[];
}

export type SetPointsReturn = {
    returnEnum: ReturnEnum
    sumField: Map<string, SetPointsField> | null,
}

export type SetPointData = {
    standardGameData: StandardGameData,
    field: string
}