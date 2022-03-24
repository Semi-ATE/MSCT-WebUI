import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from 'shared';
import { AppRoutingModule } from './app-routing.module';
import { LoggingComponent } from '../components/logging/logging.component';
import { WebsocketService } from '../services/websocket/websocket.service';
import { ElementsOverviewComponent } from '../components/elements-overview/elements-overview.component';
import { TccLotHandlingComponent } from '../components/tcc-lot-handling/tcc-lot-handling.component';
import { AppComponent } from '../app.component';
import { ElementStateComponent } from '../components/element-state/element-state.component';
import { DashboardMenuComponent } from '../components/dashboard-menu/dashboard-menu.component';
import { StoreModule } from '@ngrx/store';
import { logDataReducer } from '../store/reducers/logdata.reducers';
import { tccComponentsReducer } from '../store/reducers/components.reducers';
import { TccStateService } from '../services/tcc-state/tcc-state.service';

@NgModule({
  declarations: [
    AppComponent,
    LoggingComponent,
    ElementsOverviewComponent,
    ElementStateComponent,
    TccLotHandlingComponent,
    DashboardMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    StoreModule.forRoot({
       logs: logDataReducer,
       components: tccComponentsReducer
    })
  ],
  providers: [WebsocketService, TccStateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
