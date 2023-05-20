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

export type ThrowRes = {
    newDices: NewDices,
    moves: number
}

export type NewDices = {
    dices: Dice[],
    holdDices: Dice[]
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
    doubleGrande: number,
    sum: number,
}

export enum GetError {
    gameNotExists,
    unknownPlayer,
}

export enum SetError {
    gameNotExists,
    gameNotStarted,
    unknownPlayer,
    wrongPlayer,
    fieldFull
}

export enum SetSuccess {
    update,
    end
}
export enum ReturnEnum {
    gameFullErr,
    joinSuccess,
    illegalPlayerErr,
    rejoin,
}

export type End = {
    end: boolean,
    playersAndSums: PlayerAndSum[]
}

export type PlayerAndSum = {
    playerName: string,
    points: number
}

export enum GameNotExists {
    gameNotExistsError
}

export type RejoinData = {
    type: RejoinType,
    dices: Dice[],
    holdDices: Dice[]
    playerField: string | null,
    sumField: string,
    actPlayer: string,
    moves: number
}

export enum RejoinType {
    dice,
    playerField,
    sumField,
    end
}


export type StandardGameData = {
    serverName: number,
    playerName: string,
}

export type ChangeDiceObject = {
    dice: Dice,
    change: boolean
}

export type ThrowData = {
    standardGameData: StandardGameData,
    receiveDices: ChangeDiceObject[]
}

export type SetPointData = {
    standardGameData: StandardGameData,
    field: string
}