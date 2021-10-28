import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SquidFlatComponent } from './squid-flat/squid-flat.component';

@NgModule({
  declarations: [
    AppComponent,
    SquidFlatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [SquidFlatComponent]
})
export class AppModule { }
