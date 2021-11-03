import {Injectable} from '@angular/core';
import {SquidSize} from './models/squid-size.model';
import {HttpClient} from '@angular/common/http';
import {Participant} from './models/participant.model';
import {BehaviorSubject, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SquidService {
  private readonly URL = 'http://localhost:80/';
  _participants$ = new BehaviorSubject([])
  participants$: Observable<Participant[]> = this._participants$.asObservable();
  private participantsList: Participant[] = [];

  constructor(private httpClient: HttpClient) {
    const participantsNum: number = 400;
    for (let i = 1 ; i <= participantsNum; i++) {
      this.participantsList.push({
        name: `Test ${i}`,
        email: `Test_${i}@gmail.com`,
        phone: '0543336252',
        numberOfYearsInAngular: 5,
        chance: 1
      });
    }
  }

  refreshParticipants(): void {
    this._participants$.next(this.participantsList);
  }

  getParticipants() : Participant[] {
    return this._participants$.value;
  }

  calcSquidSize(innerWidth: number, innerHeight: number, squidLength: number): SquidSize {
    const squidPerRow = Math.ceil(Math.sqrt(squidLength));

    const squidWidth = innerWidth / squidPerRow;
    const squidHeight = innerHeight / squidPerRow ;

    console.log('squidWidth', squidWidth);
    console.log('squidHeight', squidHeight);
    return {
      width: `${squidWidth}px`,
      height: `${squidHeight}px`
    };
  }

  setParticipants(remainingParticipants: Participant[]) {
    this._participants$.next(remainingParticipants)
  }
}
