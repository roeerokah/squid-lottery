import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {SquidService} from './squid.service';
import {SquidSize} from './models/squid-size.model';
import {Participant} from './models/participant.model';
import {EMPTY, from, Observable, of} from 'rxjs';
import {concatMap, delay, map, mergeMapTo, tap, toArray} from 'rxjs/operators';

const delayBeforeRevealingAll = 1000;
const timeBetweenRemoveOfEachItem = 100;
const timeBetweenSeparationOfEach = 200;
const timeBetweenFlipEachItem = 200;
const delayAfterRemovingItems = 1000;
const delayBeforeSeparating = 2000;
const delayAfterSeparating = 1000;
const delayAfterFlipThemAll = 1000;
const delayAfterSettingPosition = 1000;

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
  private cardsAreOpen = false;
  private recentlyRemovedItems: number[] = [];

  constructor(private squidService: SquidService, private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.squidService.refreshParticipants()
    this.participants$ = this.squidService.participants$.pipe(tap(participants => {
      this.participantsLength = participants.length;
      console.log('Number of participants: ' + this.participantsLength);
      this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.participantsLength);
      setTimeout(() => {
        for (let index of this.recentlyRemovedItems) {
          // remainingParticipants.splice(index, 1);
          const selector = `#card_${index}`;
          console.log(selector);
          const itemToRemove: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
          if (!itemToRemove) continue;
          itemToRemove.style.visibility = 'visible';
          itemToRemove.style.opacity = '1';
        }
      }, 0)
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

    console.log('setCardsPosition');
    const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    cards.forEach((el: HTMLElement, index) => {
      el.style.marginTop = '0';
      el.style.marginLeft = '0';
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    });
  }

  separateOneByOne(): Observable<void> {
    const cardContainerWidth = this.squidBoardElement?.nativeElement.clientWidth;
    const cardSpacing = 0;
    let left = 0;
    const cardWidth = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientWidth;
    const cardHeight = this.squidBoardElement?.nativeElement?.querySelector('.flip-card').clientHeight;
    // initial top margin for card placement
    let top = 0;
    // initial left margin for card placement
    const leftStep = cardWidth + cardSpacing;
    const cards: HTMLElement[] = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    return from(cards).pipe(
      concatMap(card => of(card).pipe(
        map((el: HTMLElement) => {
          el.style.marginTop = `${top}px`;
          el.style.marginLeft = `${left}px`;
          left = left + leftStep;
          if (left + cardWidth + cardSpacing > cardContainerWidth) {
            left = 0;
            top += cardHeight + cardSpacing;
          }
        }),
        delay(timeBetweenSeparationOfEach)
      )),
      toArray(),
      delay(delayAfterSeparating),
      tap(() => console.log('separateOneByOne')),
      mergeMapTo(of(null))
    );
  }

  delay(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async removeItems(): Promise<Participant[]> {
    let remainingParticipants = this.squidService.getParticipants();
    const maxItemsToRemove = Math.ceil(this.participantsLength / 2);
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
          await this.delay(timeBetweenRemoveOfEachItem);
          index++;
        }
      }
      this.recentlyRemovedItems = removedItems;

      for (let index of this.recentlyRemovedItems) {
        remainingParticipants.splice(index, 1);
      }
      // Setting timeout in order to execute this code after

      await this.delay(delayAfterRemovingItems);
      return remainingParticipants;
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
    this.separateOneByOne().subscribe(() => {
      this.flipThemAll().pipe(delay(delayBeforeRevealingAll)).subscribe((() => {
        this.removeItems().then((remainingParticipants) => {
          this.continueLottery(remainingParticipants);
        })
      }));
    });
  }

  async continueLottery(remainingParticipants: Participant[]): Promise<void> {
    console.log('continue lottery');
    this.cd.detectChanges();

    this.flipThemAll().pipe(
      tap(() => {
        this.setCardsPosition(0, 0);
      }),
      delay(delayAfterSettingPosition),
      tap(() => {
        this.squidService.setParticipants(remainingParticipants);
      }),
      map(() => {
        if (remainingParticipants.length === 1) {
          this.declareWinner(remainingParticipants[0]);
          return EMPTY;
        }
      }),
      delay(delayBeforeSeparating)
    ).subscribe((flipThemAll => {
      this.separateOneByOne().subscribe(() => {
        this.flipThemAll().subscribe(() => {
          this.removeItems().then((innerRemainingParticipants) => {
            this.continueLottery(innerRemainingParticipants);
          });
        })
      })
    }));
  }

  private declareWinner(winner: Participant) {
    this.flipThemAll().subscribe()
    console.info('winner', winner);
  }

  private flipThemAll(): Observable<void> {
    return from(this.squidService.getParticipants()).pipe(
      concatMap((participant, index) => of({participant, index}).pipe(
        delay(timeBetweenFlipEachItem),
        map(({participant, index}) => {
          // console.log('flip item number: ' + participant.name);
          const selector = `#card_${index}`;
          // console.log('flip item selector: ' + selector);
          const itemToRemove: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
          if (this.cardsAreOpen) {
            itemToRemove.classList.remove('open');
          } else {
            itemToRemove.classList.add('open');
          }
        })
      )),
      toArray(),
      tap(() => {
        this.cardsAreOpen = !this.cardsAreOpen;
        console.log('flipped');
      }),
      delay(delayAfterFlipThemAll),
      mergeMapTo(of(null))
    )
  }
}
