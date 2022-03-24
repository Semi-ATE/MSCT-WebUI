import { SiteBinInformationComponent } from './site-bin-information/site-bin-information.component';
import { SystemBinStatusComponent } from './system-bin-status/system-bin-status.component';
import { CommunicationService } from './services/communication.service';
import { WebsocketService } from './services/websocket.service';
import { TestOptionComponent } from './system-control/test-option/test-option.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SystemStatusComponent } from './system-status/system-status.component';
import { SystemControlComponent } from './system-control/system-control.component';
import { SystemConsoleComponent } from './system-console/system-console.component';
import { LotHandlingComponent } from './system-control/lot-handling/lot-handling.component';
import { TestExecutionComponent } from './system-control/test-execution/test-execution.component';
import { SystemInformationComponent } from './system-information/system-information.component';
import { MenuComponent } from './menu/menu.component';
import { DebugComponent } from './debug/debug.component';
import { MINISCT_ROUTES } from './routing-table';
import { StoreModule } from '@ngrx/store';
import { statusReducer } from './reducers/status.reducer';
import { resultReducer } from './reducers/result.reducer';
import { consoleReducer } from './reducers/console.reducer';
import { userSettingsReducer } from './reducers/usersettings.reducer';
import { connectionIdReducer } from './reducers/connectionid.reducer';
import { yieldReducer } from './reducers/yield.reducer';
import { AppstateService } from './services/appstate.service';
import { StdfRecordComponent } from './stdf-record/stdf-record.component';
import { StdfRecordViewComponent } from './stdf-record-view/stdf-record-view.component';
import { RouterModule } from '@angular/router';
import { StdfRecordTypeFilterComponent } from './stdf-record-filter/stdf-record-type-filter/stdf-record-type-filter.component';
import { StdfRecordSiteNumberFilterComponent } from './stdf-record-filter/stdf-record-site-number-filter/stdf-record-site-number-filter.component';
import { StdfRecordTestNumberFilterComponent } from './stdf-record-filter/stdf-record-test-number-filter/stdf-record-test-number-filter.component';
import { StdfRecordTestTextFilterComponent } from './stdf-record-filter/stdf-record-test-text-filter/stdf-record-test-text-filter.component';
import { StdfRecordPassFailFilterComponent } from './stdf-record-filter/stdf-record-pass-fail-filter/stdf-record-pass-fail-filter.component';
import { StdfRecordProgramFilterComponent } from './stdf-record-filter/stdf-record-program-filter/stdf-record-program-filter.component';
import { YieldComponent } from './yield/yield.component';
import { SystemHandlingComponent } from './system-control/system-handling/system-handling/system-handling.component';
import { LotDataComponent } from './lot-data/lot-data.component';
import { lotdataReducer } from './reducers/lotdata.reducer';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { BinTableComponent } from './bin-table/bin-table.component';
import { binReducer } from './reducers/bintable.reducer';
import { SharedModule } from 'shared';
import { MockServerService } from './services/mockserver.service';

@NgModule({
  declarations: [
    AppComponent,
    SystemStatusComponent,
    SystemControlComponent,
    SystemConsoleComponent,
    TestOptionComponent,
    LotHandlingComponent,
    TestExecutionComponent,
    SystemInformationComponent,
    MenuComponent,
    DebugComponent,
    SystemBinStatusComponent,
    SiteBinInformationComponent,
    StdfRecordComponent,
    StdfRecordViewComponent,
    StdfRecordTypeFilterComponent,
    StdfRecordSiteNumberFilterComponent,
    StdfRecordTestNumberFilterComponent,
    StdfRecordTestTextFilterComponent,
    StdfRecordPassFailFilterComponent,
    StdfRecordProgramFilterComponent,
    YieldComponent,
    SystemHandlingComponent,
    LotDataComponent,
    ModalDialogComponent,
    BinTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    StoreModule.forRoot({
      systemStatus: statusReducer, // key must be equal to the key defined in interface AppState, i.e. systemStatus
      results: resultReducer, // key must be equal to the key defined in interface AppState, i.e. results
      consoleEntries: consoleReducer, // key must be equal to the key defined in interface AppState, i.e. consoleEntries,
      userSettings: userSettingsReducer, // key must be equal to the key defined in interface AppState, i.e. userSettings
      connectionId: connectionIdReducer, // key must be equal to the key defined in interface AppState, i.e. connectionId
      yield: yieldReducer,
      lotData: lotdataReducer,
      binTable: binReducer
    }),
    RouterModule.forRoot(MINISCT_ROUTES),
    SharedModule
  ],
  providers: [MockServerService, WebsocketService, CommunicationService, AppstateService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
