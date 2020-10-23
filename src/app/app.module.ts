import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CovidCategoryComponent } from './covid-category/covid-category.component';
import { CovidCaseListComponent } from './covid-case-list/covid-case-list.component';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { LineChartComponent } from './line-chart/line-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    CovidCategoryComponent,
    CovidCaseListComponent,
    LeafletMapComponent,
    LineChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
