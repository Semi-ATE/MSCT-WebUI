import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardStyle } from './card-config';
import { CardComponent } from './card.component';

/* eslint-disable @typescript-eslint/no-explicit-any */

declare let viewport: any;

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create card component', () => {
    expect(component).toBeTruthy();
  });

  it('should support shadow, i.e. boxShadow', () => {
    component.cardConfiguration.shadow = true;
    fixture.detectChanges();

    let card = debugElement.query(By.css('.cardShadow'));
    let cardElement = card.nativeElement;

    expect(getComputedStyle(cardElement).boxShadow).toBe('rgba(0, 0, 0, 0.4) 0px 4px 8px 0px');

    component.cardConfiguration.shadow = false;
    fixture.detectChanges();

    card = debugElement.query(By.css('.cardShadow'));
    expect(card).toBeFalsy();

    card = debugElement.query(By.css('.card'));
    cardElement = card.nativeElement;

    expect(getComputedStyle(cardElement).boxShadow).toBe('none');
  });

  it('should support labelText', () => {
    component.cardConfiguration.labelText = 'Label';
    fixture.detectChanges();

    const card = debugElement.query(By.css('h2'));
    const cardElement = card.nativeElement;

    expect(cardElement.innerHTML).toBe('Label');
  });

  it('should support cardStyle to be rowStyle', () => {
    component.cardConfiguration.cardStyle = CardStyle.ROW_STYLE;

    // we need to set a large vieport here in order to make this test
    // pass during the CI Build were the tests are executed on a headless
    // chrome instance
    viewport.set(1200, 1200);

    fixture.detectChanges();

    const card = debugElement.query(By.css('.card'));
    const cardElement = card.nativeElement;

    expect(cardElement.getAttribute('class')).toContain(CardStyle.ROW_STYLE);

    expect(getComputedStyle(cardElement).display).toBe('flex');
    expect(getComputedStyle(cardElement).flexDirection).toBe('row');
  });

  it('should support cardStyle to be columnStyle', () => {
    component.cardConfiguration.cardStyle = CardStyle.COLUMN_STYLE;
    fixture.detectChanges();

    const card = debugElement.query(By.css('.card'));
    const cardElement = card.nativeElement;

    expect(cardElement.getAttribute('class')).toContain(CardStyle.COLUMN_STYLE);

    expect(getComputedStyle(cardElement).display).toBe('flex');
    expect(getComputedStyle(cardElement).flexDirection).toBe('column');
  });

  it('should be initialized using "initCard" function', () => {
    component.cardConfiguration.initCard(true, CardStyle.COLUMN_STYLE, 'label');
    expect(component.cardConfiguration.shadow).toBe(true);
    expect(component.cardConfiguration.cardStyle).toBe(CardStyle.COLUMN_STYLE);
    expect(component.cardConfiguration.labelText).toBe('label');
  });
});
