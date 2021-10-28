import {Component, HostListener, OnInit} from '@angular/core';
import {defaultSqiuds} from "./sqiuds-mock";
import {SquidService} from "./squid.service";
import {SquidSize} from "./models/squid-size.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'squid-lottery';
  squids = defaultSqiuds
  squidSize: SquidSize;

  constructor(private squidService: SquidService) {}

  ngOnInit(): void {
    this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.squids.length)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.squidSize = this.squidService.calcSquidSize(event.target.innerWidth, event.target.innerHeight, this.squids.length)
  }
}
