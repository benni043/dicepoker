import { Injectable } from '@angular/core';
import {connect, Socket} from "socket.io-client";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket!: Socket;

  constructor() {
    this.socket = connect(`${environment.apiURL}`);
  }
}
