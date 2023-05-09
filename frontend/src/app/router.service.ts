import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor() { }

  join(playerName: string, serverName: number) {
    this.socket.emit("joinToGame", {serverName: serverName, playerName: playerName});
  }

}
