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
    pointsField: PointsField,
    pointsFieldTMP: PointsField
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

export type PointsField = {
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

export type StandardGameData = {
    serverName: number,
    playerName: string,
}

export type ChangeDiceObject = {
    dice: Dice,
    change: boolean
}

export type PlayerSockets = {
    player1ws: Socket,
    player2ws: Socket,
}

export type Throw = {
    returnEnum: ReturnEnum,
    dices: Dice[],
    end: boolean
}

export type ThrowData = {
    standardGameData: StandardGameData,
    receiveDices: ChangeDiceObject[]
}

export type JoinReturn = {
    returnEnum: ReturnEnum,
    response: PlayerSockets | null
}

export type SetPointsReturn = {
    returnEnum: ReturnEnum
    sumField: Map<string, PointsField> | null,
}

export type SetPointData = {
    standardGameData: StandardGameData,
    field: string
}