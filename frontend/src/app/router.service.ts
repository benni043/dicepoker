import {Injectable} from '@angular/core';
import {Socket} from "socket.io-client";
import {SetPointsField} from "../../../utils/game";

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() {
  }

  socket!: Socket;

  playerName: string = "";
  serverName: number = 0;

  sumField!: Map<string, SetPointsField> | null;

  join(playerName: string, serverName: number) {
    this.playerName = playerName;
    this.serverName = serverName;

    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
  }

  sendValue(elem: string) {
    this.socket.emit("setPoint", {field: elem, standardGameData: {serverName: this.serverName, playerName: this.playerName}})
  }

}
