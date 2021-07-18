import { Injectable } from "@angular/core";
import * as io from "socket.io-client";

@Injectable()
export class SocketService {
  private socket: any;

  connect(cb) {
    this.socket = io.io("http://localhost:4919");
    this.socket.on("connected", (data, isPlaying, backgroundColor) => {
      console.log(backgroundColor);
      cb(data, isPlaying, backgroundColor);
    });
    this.socket.on("shuffle", (data) => cb(data));
  }

  moveButtons(cb) {
    this.socket.on("moveButtons", (data) => cb(data));
  }

  buttonClicked(indx) {
    this.socket.emit("buttonClicked", indx);
  }

  gameOver(cb) {
    this.socket.on("gameOver", cb);
  }
}
