import {Injectable} from '@angular/core';
import {SquidSize} from "./models/squid-size.model";
import {HttpClient} from "@angular/common/http";
import {Participant} from "./models/participant.model";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SquidService {
  private readonly URL = 'http://localhost:80/';

  constructor(private httpClient: HttpClient) { }

  getParticipants(): Observable<Participant[]> {
    const participantsNumber = 71;
    const participantsList: Participant[] = [];
    for (let i = 1 ; i <= participantsNumber; i++) {
      participantsList.push({
        name: `Test ${i}`,
        email: `Test_${i}@gmail.com`,
        phone: '0543336252',
        numberOfYearsInAngular: 5,
        chance: 1
      });
    }
    return of(participantsList);
    // return this.httpClient.get<Participant[]>(`${this.URL}participants`);
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
}
