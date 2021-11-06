import { Directive, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';

import { Subject, Subscription, timer } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[counter]'
})
export class CounterDirective implements OnChanges, OnDestroy {

  // tslint:disable-next-line:variable-name
  private _counterSource$ = new Subject<any>();
  // tslint:disable-next-line:variable-name
  private _subscription = Subscription.EMPTY;

  @Input() counter: number;
  @Input() interval: number;
  @Output() value = new EventEmitter<number>();

  constructor() {

    this._subscription = this._counterSource$.pipe(
      switchMap(({ interval, count }) =>
        timer(0, interval).pipe(
          take(count),
          tap(() => this.value.emit(--count))
        )
      )
    ).subscribe();
  }

  ngOnChanges(): void {
    this._counterSource$.next({ count: this.counter, interval: this.interval });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
