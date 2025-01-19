import {Injectable} from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class LobbyRouterService {

    socket!: Socket | null;

    errorMSG: string = "";

    games: string[] = [];

    constructor(private cookieService: CookieService, private router: Router) {
    }

    connect() {
        this.socket = connect(`${environment.apiURL}/lobby`);

        this.getAllGames();

        this.socket.on("isInGame", () => {
            let playerName = this.cookieService.get("playerName");
            let gameID = this.cookieService.get("gameID");

            //temp
            playerName = "";
            gameID = "";

            if (playerName != "" && gameID != "") {
                this.navigateToGame(playerName, gameID);
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

    getAllGames() {
        this.socket!.emit("getAllGames");
    }

    navigateToGame(playerName: string, gameID: string) {
        this.socket!.disconnect();
        this.socket = null;
        this.router.navigate([`/game`, gameID], {queryParams: {playerName: playerName}}).then();
    }

    join(playerName: string, gameID: string) {
        this.cookieService.set("playerName", playerName);
        this.cookieService.set("gameID", gameID);

        this.navigateToGame(playerName, gameID);
    }

    create(serverName: string, playerCount: number) {
        this.socket!.emit("createGame", {serverName: serverName, playerCount: playerCount});
    }

    error(msg: string) {
        this.errorMSG = "";

        setTimeout(() => {
            this.errorMSG = msg;
        }, 100)
    }
}
