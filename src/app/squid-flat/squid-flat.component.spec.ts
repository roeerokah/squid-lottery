import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquidFlatComponent } from './squid-flat.component';

describe('SquidFlatComponent', () => {
  let component: SquidFlatComponent;
  let fixture: ComponentFixture<SquidFlatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquidFlatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SquidFlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
