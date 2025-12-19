import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DustChartComponent } from './dust-chart.component';

describe('DustChartComponent', () => {
  let component: DustChartComponent;
  let fixture: ComponentFixture<DustChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DustChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DustChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
