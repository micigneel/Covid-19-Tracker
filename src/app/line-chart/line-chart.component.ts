import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'node_modules/chart.js';
import { numeral } from 'node_modules/numeral';
import { CovidService } from '../shared/covid.service';
import { SubSink } from 'subsink';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { mapUtil } from '../shared/Util';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
})
export class LineChartComponent implements OnInit, OnDestroy {
  options = {
    legend: {
      display: false,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    maintainAspectRatio: false,
    tooltips: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: (tooltipItem, data)=> {
          return tooltipItem.value;
        },
      },
    },
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            parser: 'MM/DD/YY',
            tooltipFormat: 'll',
          },
          ticks: {
            fontColor: "#CCC", // this here
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
          $ticks: {
            callback: (value, index, values) => {
              return numeral(value).format('0a');
            },

          },
          ticks: {
            fontColor: "#CCC", // this here
          },
        },
      ],
    },
  };

  data: {x : string , y: number}[] = [];
  historial: any;
  category : string = "cases";
  subs = new SubSink();
  myLineChart : any ;

  constructor(private covidSer: CovidService) {}

  ngOnInit(): void {
    this.getChartData();
  }

  getChartData() {
    this.subs.add(
      this.covidSer.categorySub
        .pipe(
          distinctUntilChanged(),
          switchMap((category: string) => {
            return this.covidSer.getHistotalData()
                                .pipe(
                                  map(
                                    (resData: any)=>{
                                      this.category = category;
                                      if(category === "death")
                                          category = "deaths";
                                        return resData[category];
                                    }
                                  )
                                )
          })
        )
        .subscribe(
          (categoryHis)=>{
          let lastDatePoint;
          this.data = [];
           Object.keys(categoryHis).forEach(
             (key)=>{
               if(lastDatePoint){
                  let point = {
                      x : key,
                      y : categoryHis[key] - lastDatePoint
                  }
                  this.data.push(point);
               }
               lastDatePoint = categoryHis[key];
             }
           )
          this.generateChart();

          }
        )
    );
  }


  generateChart() {
    if(this.myLineChart){
      this.myLineChart.destroy();
    }
    this.myLineChart = new Chart('myChart', {
      type: 'line',
      data: {
        datasets: [
          {
            backgroundColor: mapUtil[this.category].hex,
            borderColor: '#C0C0C0',
            borderWidth : 1,
            data: this.data,
          },
        ],
      },
      options: this.options,
    });
  }



  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
