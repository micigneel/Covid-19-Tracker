import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { CovidService } from '../shared/covid.service';
import { mapUtil } from '../shared/Util';

// import "../assets/img/my-icon.png";
// import "../assets/img/marker-shadow.png";

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css']
})
export class LeafletMapComponent implements OnInit, AfterViewInit, OnDestroy {

 iconUrl = 'assets/img/marker-icon.png';
 shadowUrl = 'assets/img/marker-shadow.png';

  subs = new SubSink();
  activeCategory : string = "cases";
  worldwide : boolean = true;

  private map;
  group1 = L.featureGroup();
  group2 = L.featureGroup();
  group3 = L.featureGroup();

  currLat: number;
  currLong: number;

   myIcon = L.icon({
    iconUrl: this.iconUrl,
    shadowUrl: this.shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

  constructor(private covidSer : CovidService) { }

  ngOnInit(): void {
    this.map = L.map('map', {
      center: [ 20.5937 , 78.9629 ] ,
      zoom: 3.5
    });

    //Groups circle based on category
    this.handleCircleCreation();
    this.handleCategory();
    this.handleCeter();
    this.setCurrentLocation();
  }

  handleCircleCreation(){
    this.subs.add(
      this.covidSer.allCountrySub.subscribe(
        (countryDts: Array<any>)=>{
          countryDts.forEach(
            (cnt)=>{
              this.generateGroup(cnt, "cases", this.group1);
              this.generateGroup(cnt, "recovered", this.group2);
              this.generateGroup(cnt, "death", this.group3);
              this.map.addLayer(this.group1);
            }
          )
        }
      )
    );
  }

  handleCategory(){
    this.subs.add(
      this.covidSer.categorySub.subscribe(
        (category : string)=>{
          if(category !== this.activeCategory){
            this.clearLayer();
            this.addLayer(category);
            this.activeCategory = category;
          }
        }
      )
    );
  }

  handleCeter(){
    this.subs.add(
      this.covidSer.countrySub
        .pipe(
          switchMap(
            (country : string)=>{
              if(country !==  "ALL"){
                this.worldwide = false;
                return this.covidSer.retriveCases(country);
              }
              this.worldwide = true;
              return of(
                {
                  "countryInfo": {
                    "lat": 34.80746,
                    "long": -40.4796
                }
                }
              );
            }
          )
        )
        .subscribe(
          (coord : any)=>{
            let zoom= 3.5;
            if(this.worldwide)
                zoom = 2.4
            this.map.setView(new L.LatLng(coord.countryInfo.lat, coord.countryInfo.long), zoom);
            this.covidSer.emittSelectedCategory("cases");
          }
        )
    );
  }

  clearLayer(){
    if(this.map.hasLayer(this.group1)){
      this.map.removeLayer(this.group1);
    }
    else if(this.map.hasLayer(this.group2)){
      this.map.removeLayer(this.group2);
    }
    else if(this.map.hasLayer(this.group3)){
      this.map.removeLayer(this.group3);
    }
  }

  addLayer(category : string){
      if(category === "cases"){
        this.map.addLayer(this.group1);
      }
      else if(category === "recovered"){
        this.map.addLayer(this.group2);
      }
      else if(category === "death"){
        this.map.addLayer(this.group3);
      }
  }

  generateGroup(cnt : any, type : string, group : any){
    var photoImg = '<img src="'+cnt.countryInfo.flag+'" height="50px" width="100px" class="flag" />';
    var flagData = '<div> Cases : '+cnt.cases +'</div> <div> Recovered : '+cnt.recovered +'</div> <div> Deaths : '+cnt.deaths +'</div>';
    L.circle([cnt.countryInfo.lat, cnt.countryInfo.long],
                    {
                      radius: Math.sqrt(cnt.cases * mapUtil[type].multiplier*3),
                      color: mapUtil[type].hex,
                      weight:.5, opacity:0.95
                     })
                     .bindPopup(
                      photoImg + flagData
                     )
                     .addTo(group);
  }

  setCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currLat = position.coords.latitude;
        this.currLong = position.coords.longitude;
        L.marker([this.currLat, this.currLong], {icon : this.myIcon} ).addTo(this.map);
        this.saveLocation();
      });
    }

  }

  saveLocation(){
      this.covidSer.saveLocation(this.currLat, this.currLong)
          .pipe(
            distinctUntilChanged()
          )
          .subscribe();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.addTo(this.map);
  }

  ngOnDestroy(){
    this.subs.unsubscribe();
  }
}
