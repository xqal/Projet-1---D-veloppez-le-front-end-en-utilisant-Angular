import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { Subscription } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent implements OnInit, OnDestroy {
  @ViewChild('lineCanvas', { static: false }) lineCanvas!: ElementRef<HTMLCanvasElement>;

  countryName!: string;
  numberOfEntries!: number;
  numberOfMedals!: number;
  numberOfAthletes!: number;

  config!: ChartConfiguration<'line', number[], string>;
  showCanvas!: boolean;
  
  private subscription!: Subscription;
  private chart?: Chart<'line', number[], string>;
  private selectedCountry?: OlympicCountry;

  
  constructor(private olympicService: OlympicService, private route: ActivatedRoute) {}

  ngOnInit(): void {

    //RECUPERE LE PAYS SELECTIONNER
    const countryName = this.route.snapshot.params['country'];
    this.subscription = this.olympicService.getOlympics().subscribe((data: OlympicCountry[]) => {
      if (!data) {
        return;
      }

      this.selectedCountry = data.find(country => country.country === countryName);

      if (!this.selectedCountry) {
        this.countryName = 'Pays non trouvé';
        this.numberOfEntries = 0;
        this.numberOfMedals = 0;
        this.numberOfAthletes = 0;
        this.showCanvas = false;
   
        return;
      }
      //TEST NGIF
      if (countryName==="Italy") {
        this.showCanvas = false;
        return;
      }

      this.countryName = this.selectedCountry.country;
      this.numberOfEntries = this.selectedCountry.participations.length;
      this.numberOfMedals = this.selectedCountry.participations.reduce((total, participation) => total + participation.medalsCount, 0);
      this.numberOfAthletes = this.selectedCountry.participations.reduce((total, participation) => total + participation.athleteCount, 0);

      // DONNEES DU GRAPHIQUE x ET y
      const yearList = this.selectedCountry.participations.map(p => String(p.year));
      console.log(yearList);
      const medalsPerYear = this.selectedCountry.participations.map(p => p.medalsCount);

      this.showCanvas = true;

      this.config = {
        type: 'line',
        data: {
          labels: yearList,
          datasets: [{
            label: `Médailles par année - ${this.countryName}`,
            data: medalsPerYear,
            borderColor: '#04838f',
            backgroundColor: 'rgba(4, 131, 143, 0.15)',
            pointBackgroundColor: '#04838f',
            pointBorderColor: '#04838f',
            pointRadius: 4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 16,
                  family: 'Montserrat',
                  weight: 'bold',
                },
                color: '#333',
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Dates',
                font: {
                  size: 18,
                  family: 'Montserrat',
                  weight: 'bold',
                },
              },
              ticks: {
                font: {
                  size: 14,
                  family: 'Montserrat',
                },
              }
            },
            y: {
              title: {
                display: true,
              },
              beginAtZero: true,
              suggestedMin: 10,
              suggestedMax: 100,
              grace: '10%',
              ticks: {
                font: {
                  size: 14,
                  family: 'Montserrat',
                },
              }
            }
          }
        }
      };
      
      // this.chart = new Chart(this.lineCanvas.nativeElement.getContext('2d')!, config);
    });

  }

  ngAfterViewInit(): void {
    if (this.showCanvas && this.lineCanvas && this.config) {
      this.chart = new Chart(this.lineCanvas.nativeElement.getContext('2d')!, this.config);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
