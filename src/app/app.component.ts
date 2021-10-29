import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {SquidService} from './squid.service';
import {SquidSize} from './models/squid-size.model';
import {Participant} from './models/participant.model';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'squid-lottery';
  participants$: Observable<Participant[]>;
  squidSize: SquidSize;
  private participantsLength: number;

  @ViewChild('squidBoard') squidBoardElement: ElementRef;

  constructor(private squidService: SquidService) {}

  ngOnInit(): void {
    this.participants$ = this.squidService.getParticipants().pipe(tap(participants => {
      this.participantsLength = participants.length;
      console.log('Number of participants: ' + this.participantsLength);
      this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.participantsLength);
    }));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.squidSize = this.squidService.calcSquidSize(event.target.innerWidth, event.target.innerHeight, this.participantsLength);
  }

  stackCards(margin: number): void {
    let left = 0;
    const step = margin;
    const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    cards.forEach((el: HTMLElement , index) => {
        el.style.zIndex = `${index}` ;
        el.style.marginLeft = `${left}px`;
        el.style.marginTop = `${left}px`;
        left = left + step;
    });
  }

  separateInstantly(): void{
    this.setCardsPosition(0, 0);
    setTimeout(() => {
      const cardContainerWidth = this.squidBoardElement?.nativeElement.clientWidth;
      const cardSpacing = 0;
      let left = 0;
      let top = 0;
      const cardWidth = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientWidth;
      const cardHeight = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientHeight;
      const leftStep =  cardWidth + cardSpacing;
      const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
      cards.forEach((el: HTMLElement , index) => {
        el.style.marginLeft = `${left}px`;
        el.style.marginTop = `${top}px`;
        left = left + leftStep;
        if (left + cardWidth + cardSpacing > cardContainerWidth) {
          left = 0;
          top += cardHeight + cardSpacing;
        }
      });
    }, 2000);
  }

  setCardsPosition(top, left): void{
    const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    cards.forEach((el: HTMLElement , index) => {
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    });
  }

  separateOneByOne(): void{
    this.setCardsPosition(0, 0);
    setTimeout(() => {
      const cardContainerWidth = this.squidBoardElement?.nativeElement.clientWidth;
      const cardSpacing = 0;
      let left = 0;
      const cardWidth = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientWidth;
      const cardHeight = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientHeight;
      // initial top margin for card placement
      let top = 0;
      // initial left margin for card placement
      const leftStep = cardWidth + cardSpacing;
      // time lag between each card placement
      const secStep = 20;
      let time = 0;
      const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
      cards.forEach((el: HTMLElement, index) => {
        setTimeout(() => {
          el.style.marginTop = `${top}px`;
          el.style.marginLeft = `${left}px`;
          left = left + leftStep;
          if (left + cardWidth + cardSpacing > cardContainerWidth) {
            left = 0;
            top += cardHeight + cardSpacing;
          }
        }, time);
        time += secStep;
      });
    }, 1000);
  }

  ngAfterViewInit(): void {
    // this.stackCards(0.2);
    setTimeout(() => {
      this.separateOneByOne();
    }, 0);
  }
}
