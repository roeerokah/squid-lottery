import {Component, OnInit} from '@angular/core';
import {defaultSqiuds} from "./sqiuds-mock";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'squid-lottery';
  sqiuds = defaultSqiuds
  private innerWidth: number;
  private innerHeight: number;
  squidWidth: string;

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    const squareMeter = this.innerHeight * this.innerWidth;

    const squareMeterPerSquid = squareMeter / this.sqiuds.length;

    this.squidWidth = `${Math.floor(Math.sqrt(squareMeterPerSquid))}px`;
  }
}
