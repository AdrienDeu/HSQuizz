import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Chart, ChartConfiguration, ChartData, ChartType, ArcElement, Tooltip, Legend, CategoryScale, PieController } from 'chart.js';
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
  private static RARITY_COLORS: { [key: string]: string } = {
    'LEGENDARY': '#ff8000',
    'EPIC': '#a335ee',
    'RARE': '#0070dd',
    'COMMON': '#ffffff',
    'FREE': '#9d9d9d'
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };
  public pieChartType: ChartType = 'pie';

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  constructor() {
    Chart.register(ArcElement, Tooltip, Legend, CategoryScale, PieController);
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
    const bgColors: string[] = [];

    for (const rarity in this.dustStats.rarityBreakdown) {
      if (this.dustStats.rarityBreakdown.hasOwnProperty(rarity)) {
        labels.push(rarity);
        data.push(this.dustStats.rarityBreakdown[rarity]);
        bgColors.push(DustChartComponent.RARITY_COLORS[rarity.toUpperCase()] || '#cccccc');
      }
    }

    this.pieChartData.labels = labels;
    this.pieChartData.datasets[0].data = data;
    this.pieChartData.datasets[0].backgroundColor = bgColors;

    this.chart?.update();
  }
}
