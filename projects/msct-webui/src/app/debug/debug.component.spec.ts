import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugComponent } from './debug.component';
import { MockServerService } from '../services/mockserver.service';
import { CardComponent } from 'shared';
import { DropdownComponent } from 'shared';

describe('DebugComponent', () => {
  let mockServerService: MockServerService;
  let component: DebugComponent;
  let fixture: ComponentFixture<DebugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DebugComponent,
        DropdownComponent,
        CardComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockServerService = TestBed.inject(MockServerService);
    fixture = TestBed.createComponent(DebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create debug component', () => {
    expect(component).toBeTruthy();
  });
});
