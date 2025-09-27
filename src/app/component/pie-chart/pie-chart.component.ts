import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';

import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
Chart.register(...registerables);

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements OnInit, OnDestroy {
  @ViewChild('pieCanvas', { static: true }) pieCanvas!: ElementRef<HTMLCanvasElement>;

  numberOfJOS!: number;
  numberOfCountries!: number;

  private subscription! : Subscription;
  private chart?: Chart<'pie', number[], string>;

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {

    this.subscription = this.olympicService.getOlympics().subscribe((data: OlympicCountry[]) => {
      if (!data) {
        return;
      }

      this.numberOfCountries = data.length;
      this.numberOfJOS = data[0].participations.length;
    
    // DONNEES DU GRAPHIQUE
    const CountriesList = data.map((country: OlympicCountry) => country.country);
    const medalsByCountry = data.map((country: OlympicCountry) => country.participations.reduce((total, participation) => total + participation.medalsCount, 0));

    // CONFIGURATION DU GRAPHIQUE
    const config : ChartConfiguration<'pie', number[], string> = {
        type: 'pie',
        data: {
          labels: CountriesList,
          datasets: [{
            data: medalsByCountry,
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const countryName = data[index].country;
              this.router.navigate(['/detail-chart', countryName]);
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 16,
                  family: 'Montserrat',
                  weight: 'bold'
                },
                padding: 15,
                color: '#333'
              }
            }
          }
        }
      };
      
      this.chart = new Chart(this.pieCanvas.nativeElement.getContext('2d')!, config);

    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
