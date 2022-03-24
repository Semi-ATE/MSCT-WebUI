/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementStateComponent } from './element-state.component';
import { CardComponent, InformationComponent } from 'shared';
import { DebugElement } from '@angular/core';
import { ElementState, Status } from '../../models/element-status.models';

describe('ElementStatusComponent', () => {
  let component: ElementStateComponent;
  let fixture: ComponentFixture<ElementStateComponent>;
  let debugElement: DebugElement;
  const initElementState: ElementState = {
    component: 'DemoAdaptor',
    state: Status.ready,
    notices: [
      {
        message: 'DemoAdaptor is empty',
        priority: 0
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementStateComponent,
        CardComponent,
        InformationComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementStateComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create test-cell component', () => {
    expect(component).toBeTruthy();
  });

  it('should contain an lib-card tag with "Unknown" as label text', () => {
    const cardElement = debugElement.nativeElement.querySelectorAll('lib-card');
    expect(cardElement).not.toEqual(null);
    expect(cardElement.length).toBe(1);
    expect(component.testcellCardConfiguration.labelText).toBe('Unknown');
  });

  it('should contain an lib-information tag with "State: " as label text', () => {
    const infoElement = debugElement.nativeElement.querySelectorAll('lib-information');
    expect(infoElement).not.toEqual(null);
    expect(infoElement.length).toBe(2);
    expect(component.elementStateConfiguration.labelText).toBe('State: ');
  });

  it('should contain a span tag', () => {
    const spanElement = debugElement.nativeElement.querySelectorAll('span');
    expect(spanElement).not.toEqual(null);
    expect(spanElement.length).toBe(1);
  });

  describe('initConfiguration', () => {
    it('should show the initial values of element state on the component view', () => {
      component.elementState = initElementState;
      (component as any).initConfiguration();

      expect(component.testcellCardConfiguration.labelText).toBe(`${initElementState.component}`);
      expect(component.elementStateConfiguration.value).toBe(`${initElementState.state}`);
      expect(component.testcellNoticeConfiguration.value).toBe(`${initElementState.notices[0].message}`);
    });

    it('should call messageOfNotices', () => {
      const spy = spyOn<any>(component, 'getHighestPriorityNoticeMessage');
      (component as any).initConfiguration();

      expect(spy).toHaveBeenCalled();
    });

    it('should display message with higer priority', () => {
      component.elementState.notices = [
        { message: 'P1', priority: 3 },
        { message: 'P2', priority: 4 }
      ];

      (component as any).initConfiguration();

      expect(component.testcellNoticeConfiguration.value).toEqual('P2');
    });

    it('should display the first message when the priority levels are the same', () => {
      component.elementState.notices = [
        { message: 'P1', priority: 1 },
        { message: 'P2', priority: 1 }
      ];

      (component as any).initConfiguration();

      expect(component.testcellNoticeConfiguration.value).toEqual('P1');

      component.elementState.notices = [
        { message: 'P2', priority: 1 },
        { message: 'P1', priority: 1 },
      ];

      (component as any).initConfiguration();
      expect(component.testcellNoticeConfiguration.value).toEqual('P2');
    });
  });
});
