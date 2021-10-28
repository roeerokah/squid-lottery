import {Component, HostListener, OnInit} from '@angular/core';
import {SquidService} from "./squid.service";
import {SquidSize} from "./models/squid-size.model";
import {Participant} from "./models/participant.model";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'squid-lottery';
  participants$: Observable<Participant[]>;
  squidSize: SquidSize;
  private participantsLength: number;

  constructor(private squidService: SquidService) {}

  ngOnInit(): void {
    this.participants$ = this.squidService.getParticipants().pipe(tap(participants => {
      this.participantsLength = participants.length
      console.log('Number of participants: ' + this.participantsLength);
      this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.participantsLength)
    }));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.squidSize = this.squidService.calcSquidSize(event.target.innerWidth, event.target.innerHeight, this.participantsLength)
  }
}
