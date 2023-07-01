import {Socket} from "socket.io-client";

export type Game = {
  players: Player[],
  state: GameState,
  numberOfPlayersWhoLeft: number,
  numberOfPlayersJoined: number,
}

export type Player = {
  playerName: string,
  socket: Socket | undefined,
  dices: Dice[],
  holdDices: Dice[]
  points: number,
  movesLeft: number,
  isOnline: boolean,
  isOnMove: boolean,
  pointsField: PointsField,
  pointsFieldTMP: PointsField
}

export enum GameState {
  joining = "joining",
  running = "running",
  finished = "finished",
  unknown = "unknown"
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
  one ,
  two ,
  three ,
  four ,
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

export type End = {
  winner: string,
  sumField: string
}

export type RejoinData = {
  type: RejoinType,
  dices: Dice[],
  holdDices: Dice[]
  playerField: string | null,
  sumField: string | null,
  actPlayer: string,
  moves: number
}

export enum RejoinType {
  dice,
  playerField,
  sumField,
}


export type StandardGameData = {
  serverName: string,
  playerName: string,
}

export type ChangeDiceObject = {
  dice: Dice,
  change: boolean
}