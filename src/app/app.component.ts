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

  constructor(private squidService: SquidService) {
  }

  ngOnInit(): void {
    this.squidService.refreshParticipants()
    this.participants$ = this.squidService.participants$.pipe(tap(participants => {
      this.participantsLength = participants.length;
      console.log('Number of participants: ' + this.participantsLength);
      this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.participantsLength);
    }));
  }

  userByName(index, item) {
    return item.name;
  }
  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.squidSize = this.squidService.calcSquidSize(event.target.innerWidth, event.target.innerHeight, this.participantsLength);
  }

  stackCards(margin: number): void {
    let left = 0;
    const step = margin;
    const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    cards.forEach((el: HTMLElement, index) => {
      el.style.zIndex = `${index}`;
      el.style.marginLeft = `${left}px`;
      el.style.marginTop = `${left}px`;
      left = left + step;
    });
  }

  separateInstantly(): void {
    setTimeout(() => {
      const cardContainerWidth = this.squidBoardElement?.nativeElement.clientWidth;
      const cardSpacing = 0;
      let left = 0;
      let top = 0;
      const cardWidth = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientWidth;
      const cardHeight = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientHeight;
      const leftStep = cardWidth + cardSpacing;
      const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
      cards.forEach((el: HTMLElement, index) => {
        el.style.marginLeft = `${left}px`;
        el.style.marginTop = `${top}px`;
        left = left + leftStep;
        if (left + cardWidth + cardSpacing > cardContainerWidth) {
          left = 0;
          top += cardHeight + cardSpacing;
        }
      });
    }, 1000);
  }

  setCardsPosition(top, left): void {
    console.log('asdasd');
    const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    cards.forEach((el: HTMLElement, index) => {
      el.style.marginTop = '0';
      el.style.marginLeft = '0';
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    });
  }

  separateOneByOne(): void {
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
      const secStep = 5;
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

  delay(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async removeItems(): Promise<void> {
    let remainingParticipants = this.squidService.getParticipants();
    const maxItemsToRemove = Math.ceil(this.participantsLength / 3);
    const removedItems: number[] = [];
    let index = 1;
    if (this.participantsLength > 1) {
      while (index <= maxItemsToRemove) {
        const randomItemNumber = this.getRandomNumber(0, this.participantsLength - 1);
        if (removedItems.indexOf(randomItemNumber) === -1) {
          console.log('remove item number: ' + remainingParticipants[randomItemNumber].name);
          const selector = `#card_${randomItemNumber}`;
          const itemToRemove: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
          itemToRemove.style.visibility = 'hidden';
          itemToRemove.style.opacity = '0';
          removedItems.push(randomItemNumber);
          await this.delay(100);
          index++;
        }
      }

      setTimeout(() => {
        for (let index of removedItems) {
          remainingParticipants.splice(index, 1);
          const selector = `#card_${index}`;
          const itemToRemove: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
          itemToRemove.style.visibility = 'visible';
          itemToRemove.style.opacity = '1';
        }

      this.squidService.setParticipants(remainingParticipants)

      }, 0)
      this.setCardsPosition(0, 0);
      await this.delay(500);
      this.startLottery();
    }
  }

  getRandomNumber(min, max): number {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }

  ngAfterViewInit(): void {
    // this.stackCards(0.2);
   this.startLottery();
  }

  startLottery(): void {

    this.separateOneByOne();
    setTimeout(() => {
      this.flipThemAll();
    }, 0);
    setTimeout(() => {
      this.removeItems();
    }, 5000);
  }

  private flipThemAll() {

  }
}
