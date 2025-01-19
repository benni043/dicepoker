import { Injectable } from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {environment} from "../environments/environment";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class LobbyRouterService {

  socket!: Socket;

  errorMSG: string = "";

  playerName: string = "";
  serverName: string = "";

  games: string[] = [];


  constructor(private cookieService: CookieService) {
    this.socket = connect(`${environment.apiURL}/lobby`);

    this.socket.emit("getAllGames");

    this.socket.on("isInGame", () => {
      if (this.cookieService.get("playerName") != null && this.cookieService.get("serverName") != null) {
        this.socket.emit("joinToGame", {serverName: this.serverName, playerName: this.playerName});
      }
    })

    this.socket.on("gameEnd", () => {
      this.error("Das Spiel ist bereits beendet!")
    })
    this.socket.on("gameNotExistsErr", () => {
      this.error("Dieser Server ist voll!");
    })
    this.socket.on("gameAlreadyExists", () => {
      this.error("Dieser Lobbyname ist bereits vergeben!")
    })
    this.socket.on("gameFinished", () => {
      this.error("Das Spiel ist bereits beendet!");
    })
    this.socket.on("unknownPlayer", () => {
      this.error("Dieser Name ist bereits vergeben!")
    })
    this.socket.on("gameFullErr", () => {
      this.error("Das Spiel ist voll!");
    })
    this.socket.on("illegalPlayerErr", () => {
      this.error("Dieser Name ist bereits vergeben!")
    })

    this.socket.on("getGames", (games) => {
      this.games = games;
    })
  }

  join(playerName: string, serverName: string) {
    this.playerName = playerName;
    this.serverName = serverName;

    this.cookieService.set("playerName", playerName);
    this.cookieService.set("serverName", serverName);

    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
  }

  create(serverName: string, playerCount: number) {
    this.socket.emit("createGame", {serverName: serverName, playerCount: playerCount});
  }

  error(msg: string) {
    this.errorMSG = "";

    setTimeout(() => {
      this.errorMSG = msg;
    }, 100)
  }
}
