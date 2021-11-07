import {Injectable} from '@angular/core';
import {SquidSize} from './models/squid-size.model';
import {HttpClient} from '@angular/common/http';
import {Participant} from './models/participant.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {config} from "../config/config";

@Injectable({
  providedIn: 'root'
})
export class SquidService {
  private readonly URL = 'http://localhost:80/';
  _participants$ = new BehaviorSubject([])
  participants$: Observable<Participant[]> = this._participants$.asObservable();
  private participantsList: Participant[] = [];

  constructor(private httpClient: HttpClient) {
    const names = ['Roee Rokah', 'Yelena kuznitzov', 'Shlomo Avarzil', 'Rina Mesukas'];
    const participantsNum: number = 100;
    for (let i = 1 ; i <= participantsNum; i++) {
      this.participantsList.push({
        name: names[i % 4],
        email: `Test_${i}@gmail.com`,
      });
    }
  }

  refreshParticipants(): void {
    this.httpClient.get<Participant[]>(`${this.URL}participants?fromSheet=${config.fromSheet}`).subscribe(participants => {
      console.log(participants);
      this._participants$.next(participants);
    })
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
      width: squidWidth,
      height: squidHeight,
    };
  }

  setParticipants(remainingParticipants: Participant[]) {
    this._participants$.next(remainingParticipants)
  }

  declareWinners(winners: Record<string, Participant>): Observable<void> {
    return this.httpClient.post<void>(`${this.URL}declare-winner?writeToSheet=${config.writeToSheet}`, winners)
  }
}
