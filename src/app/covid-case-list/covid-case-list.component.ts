import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { Country } from '../covid-category/CountryModel';
import { CovidService } from '../shared/covid.service';

@Component({
  selector: 'app-covid-case-list',
  templateUrl: './covid-case-list.component.html',
  styleUrls: ['./covid-case-list.component.css']
})
export class CovidCaseListComponent implements OnInit, OnDestroy {

  countryCases : Country[] = [];
  subs = new SubSink();
  constructor(private covidServ : CovidService) { }

  ngOnInit(): void {
    this.subs.add(
      this.covidServ.getAllCountries()
        .pipe(
          map(
            (resData: Array<any>)=>{
              return resData.sort(
                (country1 : any , country2 : any)=>{
                  return country1.cases > country2.cases ? -1 : 1
                }
              );
            }
          )
        )
        .subscribe(
          (sortedData : Array<any>)=>{
            sortedData.forEach(
              (country : any)=>{
                let ctry = new Country(country.country , country.countryInfo.iso2 ,country.cases)
                this.countryCases.push(ctry);
              }
            )
          },
          err=>{
            console.log("Error for getting ALL Cases and its total :: "+ err)
          }
        ),
    );
  }

  ngOnDestroy(){
    this.subs.unsubscribe()
  }

}
