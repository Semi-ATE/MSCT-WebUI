import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'shared';
import { AppComponent } from './app.component';
import { WebsocketService } from './services/websocket/websocket.service';
import { TccMockServerService } from './services/tcc-mock-server/tcc-mock-server.service';
import { DashboardMenuComponent } from './components/dashboard-menu/dashboard-menu.component';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { tccComponentsReducer } from './store/reducers/components.reducers';
import { logDataReducer } from './store/reducers/logdata.reducers';
import { StoreModule } from '@ngrx/store';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockServer: TccMockServerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        RouterModule,
        RouterTestingModule,
        StoreModule.forRoot({
          logs: logDataReducer,
          components: tccComponentsReducer
        })
      ],
      declarations: [
        AppComponent,
        DashboardMenuComponent
      ],
      providers: [
        WebsocketService,
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    mockServer = TestBed.inject(TccMockServerService);
    TestBed.inject(WebsocketService);
    fixture = TestBed.createComponent(AppComponent);

    component = fixture.componentInstance;
    fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockServer.ngOnDestroy();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should have as title "Tcc Dashboard"', () => {
    expect(component.title).toEqual('Tcc Dashboard');
  });

  it('should display websocket error', () => {
    expect(component.connectionError).toEqual('Server not reachable');
  });
});
