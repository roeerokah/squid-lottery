import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SquidFlatComponent } from './squid-flat/squid-flat.component';
import {HttpClientModule} from '@angular/common/http';
import { CounterDirective } from './directives/counter.directive';

@NgModule({
  declarations: [
    AppComponent,
    SquidFlatComponent,
    CounterDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
