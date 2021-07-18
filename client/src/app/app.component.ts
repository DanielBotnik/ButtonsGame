import { AfterViewInit, ElementRef } from "@angular/core";
import { Component } from "@angular/core";
import { SocketService } from "./socket.service";

@Component({
  selector: "my-app",
  template: `<table *ngIf="buttonsData">
    <tr *ngFor="let _ of [].constructor(4); let i = index">
      <td *ngFor="let __ of [].constructor(4); let j = index">
        <button
          (click)="buttonClick(i * 4 + j)"
          [ngStyle]="{ backgroundColor: buttonsData[i * 4 + j].color }"
          class="game-button"
          [ngClass]="{
            'empty-button': buttonsData[i * 4 + j].text === '0'
          }"
        >
          {{ buttonsData[i * 4 + j].text }}
        </button>
      </td>
    </tr>
  </table>`,
  styleUrls: ["app.component.css"],
  providers: [SocketService],
})
export class AppComponent implements AfterViewInit {
  buttonsData: Array<TextAndColor>;
  constructor(
    private socketService: SocketService,
    private elementRef: ElementRef
  ) {
    this.socketService.connect(
      (data, isPlaying = true, backgroundColor = "#FFFFFF") => {
        console.log(backgroundColor);
        this.buttonsData = data;
        if (!isPlaying) setTimeout(this.gameOver, 0);
        else setTimeout(this.gameNotOver, 0);
        this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
          backgroundColor;
      }
    );
    this.socketService.moveButtons((data) => this.moveButtons(data));
    this.socketService.gameOver(this.gameOver);
  }

  ngAfterViewInit() {}

  buttonClick(clickedIndx) {
    this.socketService.buttonClicked(clickedIndx);
  }

  moveButtons(data) {
    const { clickedIndx, emptyIndex, backgroundColor } = data;
    let tempData = this.buttonsData[clickedIndx];
    this.buttonsData[clickedIndx] = this.buttonsData[emptyIndex];
    this.buttonsData[emptyIndex] = tempData;
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      backgroundColor;
  }

  gameOver() {
    const elements: Element[] = Array.from(
      document.getElementsByClassName("game-button")
    );
    for (let htmlElement of elements) {
      (htmlElement as HTMLButtonElement).disabled = true;
    }
  }

  gameNotOver() {
    const elements: Element[] = Array.from(
      document.getElementsByClassName("game-button")
    );
    for (let htmlElement of elements) {
      (htmlElement as HTMLButtonElement).disabled = false;
    }
  }
}

class TextAndColor {
  text: string;
  color: string;

  constructor(text: string, color: string) {
    this.text = text;
    this.color = color;
  }
}
