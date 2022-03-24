import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create button component', () => {
    expect(component).toBeTruthy();
  });

  it('should support disabled attribute', () => {
    component.buttonConfig.disabled = true;
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    const buttonElement = button.nativeElement;

    expect(buttonElement.hasAttribute('disabled')).toBeTruthy('button is expected to be disabled');

    component.buttonConfig.disabled = false;
    fixture.detectChanges();

    const button1 = debugElement.query(By.css('button'));
    const buttonElement1 = button1.nativeElement;

    expect(!buttonElement1.hasAttribute('disabled')).toBeTruthy('button is expected to be enabled, i.e. to have no attribute disabled');
  });

  it('should support labelText', () => {
    component.buttonConfig.labelText = 'Test label';
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    const buttonElement = button.nativeElement;

    expect(buttonElement.innerHTML.trim()).toBe('Test label');
  });

  it('should support textColor', () => {
    // we set the text color to R=1, G=2, and B=3
    component.buttonConfig.textColor = '#010203';
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    const buttonElement = button.nativeElement;

    expect(buttonElement.getAttribute('style')).toContain('color: rgb(1, 2, 3)');
  });

  it('should support backgroundColor', () => {
    component.buttonConfig.backgroundColor = '#ff0000';
    fixture.detectChanges();

    const button = debugElement.query(By.css('button'));
    const buttonElement = button.nativeElement;

    expect(buttonElement.getAttribute('style')).toContain('background-color: rgb(255, 0, 0);');
  });

  it('should emit event when button is clicked', () => {
    const spyEmit = spyOn(component.buttonClickEvent, 'emit');
    const button = debugElement.query(By.css('button'));
    const buttonElement = button.nativeElement;
    buttonElement.dispatchEvent(new Event('click'));
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should be initialized using "initButton" function', () => {
    component.buttonConfig.initButton('label', false);
    expect(component.buttonConfig.labelText).toBe('label');
    expect(component.buttonConfig.disabled).toBe(false);
  });
});
