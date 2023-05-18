import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit{

  constructor() {
  }

  ngOnInit(): void {
    this.showMessage(this.message, 3000)
  }

  @Input() message: string = "";
  animation: boolean = false;

  showMessage(message: string, duration: number) {
    setTimeout(() => {
      this.animation = true;

      setTimeout(() => {
        this.hideMessage();
      }, 1500);
    }, duration);
  }

  hideMessage() {
    this.message = '';
  }

}
