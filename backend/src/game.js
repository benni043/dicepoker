"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejoinType = exports.GameNotExists = exports.ReturnEnum = exports.SetSuccess = exports.Change = exports.Create = exports.SetError = exports.GetError = exports.Dice = exports.GameState = void 0;
var GameState;
(function (GameState) {
    GameState["joining"] = "joining";
    GameState["running"] = "running";
    GameState["finished"] = "finished";
    GameState["unknown"] = "unknown";
})(GameState = exports.GameState || (exports.GameState = {}));
var Dice;
(function (Dice) {
    Dice[Dice["one"] = 0] = "one";
    Dice[Dice["two"] = 1] = "two";
    Dice[Dice["three"] = 2] = "three";
    Dice[Dice["four"] = 3] = "four";
    Dice[Dice["five"] = 4] = "five";
    Dice[Dice["six"] = 5] = "six";
})(Dice = exports.Dice || (exports.Dice = {}));
var GetError;
(function (GetError) {
    GetError["gameNotExists"] = "gameNotExists";
    GetError["unknownPlayer"] = "unknownPlayer";
})(GetError = exports.GetError || (exports.GetError = {}));
var SetError;
(function (SetError) {
    SetError["gameNotExists"] = "gameNotExists";
    SetError["gameNotStarted"] = "gameNotStarted";
    SetError["gameFinished"] = "gameFinished";
    SetError["unknownPlayer"] = "unknownPlayer";
    SetError["wrongPlayer"] = "wrongPlayer";
    SetError["fieldFull"] = "fieldFull";
})(SetError = exports.SetError || (exports.SetError = {}));
var Create;
(function (Create) {
    Create[Create["illegalPlayer"] = 0] = "illegalPlayer";
    Create[Create["alreadyExists"] = 1] = "alreadyExists";
    Create[Create["success"] = 2] = "success";
})(Create = exports.Create || (exports.Create = {}));
var Change;
(function (Change) {
    Change[Change["illegalArgs"] = 0] = "illegalArgs";
    Change[Change["success"] = 1] = "success";
})(Change = exports.Change || (exports.Change = {}));
var SetSuccess;
(function (SetSuccess) {
    SetSuccess["update"] = "update";
    SetSuccess["end"] = "end";
})(SetSuccess = exports.SetSuccess || (exports.SetSuccess = {}));
var ReturnEnum;
(function (ReturnEnum) {
    ReturnEnum[ReturnEnum["gameFullErr"] = 0] = "gameFullErr";
    ReturnEnum[ReturnEnum["joinSuccess"] = 1] = "joinSuccess";
    ReturnEnum[ReturnEnum["illegalPlayerErr"] = 2] = "illegalPlayerErr";
    ReturnEnum[ReturnEnum["rejoin"] = 3] = "rejoin";
    ReturnEnum[ReturnEnum["gameEnd"] = 4] = "gameEnd";
})(ReturnEnum = exports.ReturnEnum || (exports.ReturnEnum = {}));
var GameNotExists;
(function (GameNotExists) {
    GameNotExists["gameNotExistsError"] = "gameNotExistsError";
})(GameNotExists = exports.GameNotExists || (exports.GameNotExists = {}));
var RejoinType;
(function (RejoinType) {
    RejoinType[RejoinType["dice"] = 0] = "dice";
    RejoinType[RejoinType["playerField"] = 1] = "playerField";
    RejoinType[RejoinType["sumField"] = 2] = "sumField";
})(RejoinType = exports.RejoinType || (exports.RejoinType = {}));
