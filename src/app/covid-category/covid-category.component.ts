import { Component, OnDestroy, OnInit } from '@angular/core';
import { CovidService } from '../shared/covid.service';
import { Country } from './CountryModel';
import { SubSink } from '../../../node_modules/subsink';
import { Case } from './CaseModel';

@Component({
  selector: 'app-covid-category',
  templateUrl: './covid-category.component.html',
  styleUrls: ['./covid-category.component.css']
})
export class CovidCategoryComponent implements OnInit, OnDestroy {

  subs = new SubSink();
  countries : Country[] = [];
  categories : Case[] = [];
  seletedCountry : string = "ALL";
  selectedCategory : string = 'cases';

  constructor(private covidServ : CovidService) { }

  ngOnInit(): void {
     this.subs.add(
       this.covidServ.getAllCountries()
       .subscribe(
        (resData: Array<any>)=>{
          this.covidServ.contryDetails(resData);
          resData.forEach(element => {
            let co = new Country(element.country,element.countryInfo.iso2,element.cases);
            this.countries.push(co)
          });
        },
        err=>{
          console.log("Error for getting countries :: "+ err)
        }
      )
     );

     this.subs.add(
       this.covidServ.retriveCases('ALL').subscribe(
         (resData : any)=>{
          this.handleData(resData);
         },
         err=>{
           console.log("Error for getting ALL Cases :: "+ err)
         }
       )
     );
  }


  changeCountry(cntry : string){
    this.seletedCountry = cntry;
    this.covidServ.emittSelectedCountry(this.seletedCountry);
    this.subs.add(
      this.covidServ.retriveCases(cntry).subscribe(
        (resData : any)=>{
           this.handleData(resData)
        },
        err=>{
          console.log("Error in changeCountry for getting "+cntry+" Cases :: "+ err)
        }
      )
    );

  }

  change(type){
    this.selectedCategory = type;
    this.covidServ.emittSelectedCategory(type);
  }

  handleData(resData : any ){
    let activeCase = new Case("cases","Coronavirus Case" ,
                        this.convert(Number(resData.todayCases)),
                        this.convert(Number(resData.cases)));
    let recoveredCase = new Case("recovered", "Recovered" ,
                        this.convert(Number(resData.todayRecovered)),
                        this.convert(Number(resData.recovered)));
    let deathCase = new Case("death", "Deaths" ,
                        this.convert(Number(resData.todayDeaths)),
                        this.convert(Number(resData.deaths)));
    this.categories = [];
    this.categories.push(activeCase);
    this.categories.push(recoveredCase);
    this.categories.push(deathCase);
    this.selectedCategory = 'cases';
  }

  convert(value)
  {
    if(value>=1000000)
    {
        value=Math.round(value/1000000 )+"M"
    }
    else if(value>=1000)
    {
        value=Math.round(value/1000)+"K";
    }
    return value;
  }

  ngOnDestroy(){
    this.subs.unsubscribe()
  }

}
