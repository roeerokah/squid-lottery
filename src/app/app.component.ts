import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {SquidService} from './squid.service';
import {SquidSize} from './models/squid-size.model';
import {Participant} from './models/participant.model';
import { from, Observable, of} from 'rxjs';
import {concatMap, delay, filter, map, mergeMapTo, switchMap, take, tap, toArray} from 'rxjs/operators';
import confetti from 'canvas-confetti';
import {LotteryStatus} from './enums/abstract-control-status.enum';

const delayBeforeRevealingAll = 1000;
let timeBetweenRemoveOfEachItem = 10;
const timeBetweenSeparationOfEach = 20;
const timeBetweenFlipEachItem = 0;
let delayAfterRemovingItems = 1000;
const delayBeforeSeparating = 2000;
const delayAfterSeparating = 1000;
const delayAfterFlipThemAll = 1000;
const delayAfterSettingPosition = 1000;
const padding = 5;
let nextWinner = 2;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly LotteryStatus = LotteryStatus;
  @ViewChild('squidBoard') squidBoardElement: ElementRef;
  title = 'squid-lottery';
  participants$: Observable<Participant[]>;
  squidSize: SquidSize;
  private participantsLength: number;
  private cardsAreOpen = false;
  lotteryStatus: LotteryStatus;
  counter: number;
  winners: Record<string, Participant> = {};

  constructor(private squidService: SquidService, private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.squidService.refreshParticipants();
    this.lotteryStatus = LotteryStatus.START;
    // For debugging enable this line
    // this.counterEvent(0);
  }

  userByName(index, item) {
    return item.name;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.squidSize = this.squidService.calcSquidSize(event.target.innerWidth, event.target.innerHeight, this.participantsLength, padding);
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
      cards.forEach((el: HTMLElement, ) => {
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

  setCardsPosition(top = padding, left = padding): void {
    console.log('setCardsPosition');
    const cards = this.squidBoardElement?.nativeElement?.querySelectorAll('.flip-card');
    cards.forEach((el: HTMLElement, ) => {
      el.style.marginTop = '0';
      el.style.marginLeft = '0';
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    });
  }

  separateOneByOne(): Observable<void> {
    const cardContainerWidth = this.squidBoardElement?.nativeElement.clientWidth;
    const cardSpacing = padding;
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

  async removeItems(amount?: number): Promise<Participant[]> {
    let remainingParticipants = [...this.squidService.getParticipants()];
    const maxItemsToRemove = amount ?? Math.ceil(this.participantsLength / 2);
    const removedItems: number[] = [];
    let removedCounter = 1;
    console.log(this.participantsLength);
    if (this.participantsLength > 1) {
      while (removedCounter <= maxItemsToRemove) {
        const randomItemNumber = this.getRandomNumber(0, this.participantsLength - 1);
        if (removedItems.indexOf(randomItemNumber) === -1) {
          const selector = `#card_${randomItemNumber}`;
          console.log(selector);
          const itemToRemove: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
          itemToRemove.style.visibility = 'hidden';
          itemToRemove.style.opacity = '0';
          console.log('remove item number: ' + remainingParticipants[randomItemNumber].name);
          removedItems.push(randomItemNumber);

          const participantPlace = this.participantsLength - removedCounter + 1;
          if (participantPlace <= 10) {
            this.winners[participantPlace] = { ...remainingParticipants[randomItemNumber]};
          }
          await this.delay(timeBetweenRemoveOfEachItem);
          removedCounter++;
        }
      }

      for (const index of removedItems) {
        remainingParticipants[index] = null;
      }
      remainingParticipants = remainingParticipants.filter(value => !!value);
      await this.delay(delayAfterRemovingItems);
      return remainingParticipants;
    }
  }

  getRandomNumber(min, max): number {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }

  startCountdown(): void {
    this.lotteryStatus = LotteryStatus.PRECOUNTDOWN;
    this.playAudio();
    setTimeout(() => {
      this.lotteryStatus = LotteryStatus.COUNTDOWN;
    }, 300);
  }

  counterEvent(value): void {
    if (value === 0) {
      setTimeout(() => {
        this.startLottery();
      }, 1400);
    }
    this.counter = value;
  }

  startLottery(): void {
    /*
    * separate
    * flip
    * remove half
    * setPosition
    * remove
     */
    this.lotteryStatus = LotteryStatus.PROCESSING;
    this.participants$ = this.squidService.participants$.pipe(
      filter((p) => !!p?.length),
      tap(participants => {
        this.participantsLength = participants.length;
        console.log('Number of participants: ' + this.participantsLength);
      }));
    this.squidService.participants$.pipe(filter((participants) => !!participants?.length), take(1)).subscribe(participants => {
      this.participantsLength = participants.length;
      console.log('Number of participants: ' + this.participantsLength);
      this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.participantsLength, padding);
      this.cd.detectChanges();
    });
    this.separateOneByOne().subscribe(() => {
      this.flipThemAll().pipe(delay(delayBeforeRevealingAll)).subscribe((() => {
        this.removeItems().then((remainingParticipants) => {
          this.continueLottery(remainingParticipants);
        });
      }));
    });
  }

  async continueLottery(remainingParticipants: Participant[]): Promise<void> {
    console.log('continue lottery');
    this.cd.detectChanges();

    this.flipThemAll().pipe(
      take(1),
      tap(() => {
        this.setCardsPosition();
      }),
      delay(delayAfterSettingPosition),
      tap(() => {
        this.setRemainingAndCalcSize(remainingParticipants);
      }),
      map(() => {
        if (remainingParticipants.length < 200) {
          timeBetweenRemoveOfEachItem = 100;
          delayAfterRemovingItems = 1500;
        }
        if (remainingParticipants.length < 100) {
          timeBetweenRemoveOfEachItem = 200;
          delayAfterRemovingItems = 2500;
        }

        if (remainingParticipants.length < 50) {
          timeBetweenRemoveOfEachItem = 400;
          delayAfterRemovingItems = 3000;
        }
      }),
      delay(delayBeforeSeparating),
      switchMap(() => this.separateOneByOne()),
      switchMap(() => this.flipThemAll()),
    ).subscribe((() => {
      this.removeItems().then((innerRemainingParticipants) => {
        if (innerRemainingParticipants.length <= 20) {
          this.flipThemAll().pipe(take(1)).subscribe(() => {

            timeBetweenRemoveOfEachItem = 800; // Remove slowly in the end
            this.setCardsPosition();
            this.delay(delayAfterSettingPosition).then(() => {
              this.setRemainingAndCalcSize(innerRemainingParticipants);
              this.delay(delayBeforeSeparating).then(() => {
                this.separateOneByOne().pipe(take(1)).subscribe(() => {
                  this.flipThemAll().pipe(take(1)).subscribe(() => {

                    delayAfterRemovingItems = 200;
                    this.removeItems(innerRemainingParticipants.length - 1).then((innerRemainingParticipants) => {
                      this.setCardsPosition();
                      this.setRemainingAndCalcSize(innerRemainingParticipants);
                      this.declareWinner(innerRemainingParticipants[0]);
                    });
                  });
                });
              });
            });
          });
        } else {
          this.continueLottery(innerRemainingParticipants);
        }
      });
    }));
  }

  private setRemainingAndCalcSize(remainingParticipants: Participant[]): void {
    console.log('setParticipant');
    this.participantsLength = remainingParticipants.length;
    this.squidService.setParticipants(remainingParticipants);
    this.squidSize = this.squidService.calcSquidSize(window.innerWidth, window.innerHeight, this.participantsLength, padding);
    setTimeout(() => {

      for (let i = 0; i < remainingParticipants.length; i++) {
        const selector = `#card_${i}`;
        console.log(selector);
        const itemToRemove: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
        itemToRemove.style.visibility = 'visible';
        itemToRemove.style.opacity = '1';
      }
      this.cd.detectChanges();
    }, 0);
  }

  private declareWinner(winner: Participant): void {
    this.showConfetti();
    console.info('winner', winner);
    this.winners[1] = winner;
    this.squidService.declareWinners(this.winners).subscribe();
    console.log(this.winners);
  }

  private getNextWinner(): void {
    const selector = `#card_0 .flip-card-back h1`;
    const winnerElement: HTMLElement = this.squidBoardElement?.nativeElement?.querySelector(selector);
    if (this.winners[nextWinner]) {
      winnerElement.textContent =  this.winners[nextWinner].name;
      this.cd.detectChanges();
      nextWinner++;
    }
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
    );
  }

  private getRandomInRange(min, max): number {
    return Math.random() * (max - min) + min;
  }

  private showConfetti(): void{
    const duration = 1000 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: this.getRandomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: this.getRandomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }

  private playAudio(): void{
    const audio = new Audio();
    audio.src = '../../../assets/audio/next-audio.wav';
    audio.load();
    audio.play();
  }
}
