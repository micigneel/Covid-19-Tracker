import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Url  from './UrlConst';
import { share } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn : 'root'
})
export class CovidService {


  allCountrySub = new Subject<Array<any>>()
  categorySub = new BehaviorSubject<string>("cases");
  countrySub = new BehaviorSubject<string>("ALL");


  constructor(private http : HttpClient){}

  getAllCountries(){
    return this.http.get(Url.ALL_STATE).pipe(share());
  }

  retriveCases(country : string){
    if(country === 'ALL'){
      return this.http.get(Url.ALL_CASES);
    }
    else{
      return this.http.get(Url.SPECIFIC_COUNTRY_CASES+ country + "?strict=true")
    }
  }

  getHistotalData(){
    return this.http.get(Url.HISTORIAL_LAST_120);
  }

  contryDetails(countryDts : Array<any>){
     this.allCountrySub.next(countryDts);
  }

  emittSelectedCategory(category : string){
      this.categorySub.next(category);
  }

  emittSelectedCountry(country : string){
      this.countrySub.next(country);
  }


  saveLocation(lat : number , long : number ){
      const loc = {
        lat : lat,
        long : long,
        date : new Date().toLocaleString()
      }
      return this.http.post<{lat : number , long : number, date : string}>(Url.SAVE_LOCATION, loc);
  }

}
