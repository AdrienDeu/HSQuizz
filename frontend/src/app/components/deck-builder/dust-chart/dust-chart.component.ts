import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Chart, ChartConfiguration, ChartData, ChartType, ArcElement, Tooltip, Legend, CategoryScale } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DustStats } from '../../../services/dust-calculator.service';

@Component({
  selector: 'app-dust-chart',
  templateUrl: './dust-chart.component.html',
  styleUrls: ['./dust-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, BaseChartDirective] // Add CommonModule here
})
export class DustChartComponent implements OnChanges {
  @Input() dustStats: DustStats | null = null;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            if (context.parsed !== null) {
              return `${label}: ${context.parsed} dust`;
            }
            return label;
          }
        }
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    }]
  };
  public pieChartType: ChartType = 'pie';

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor() {
    Chart.register(ArcElement, Tooltip, Legend, CategoryScale);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dustStats'] && this.dustStats) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (!this.dustStats) {
      return;
    }

    const labels: string[] = [];
    const data: number[] = [];

    for (const rarity in this.dustStats.rarityBreakdown) {
      if (this.dustStats.rarityBreakdown.hasOwnProperty(rarity)) {
        labels.push(rarity);
        data.push(this.dustStats.rarityBreakdown[rarity]);
      }
    }

    this.pieChartData.labels = labels;
    this.pieChartData.datasets[0].data = data;

    this.chart?.update();
  }
}
