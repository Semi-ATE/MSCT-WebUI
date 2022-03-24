/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { InputComponent } from './input.component';
import { InputType } from './input-config';
import { StorageMap } from '@ngx-pwa/local-storage';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let debugElement: DebugElement;
  let storage: StorageMap;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputComponent ],
      schemas: [],
      imports: [
        FormsModule,
      ]
    }).compileComponents();
  });

  beforeEach(async () => {
    storage = TestBed.inject(StorageMap);
    await storage.clear().toPromise();
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create input component', () => {
    expect(component).toBeTruthy();
  });

  it('should support disabled attribute', () => {
    component.inputConfig.disabled = true;
    fixture.detectChanges();

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.hasAttribute('disabled')).toBeTruthy('input field is expected to be disabled');

    component.inputConfig.disabled = false;
    fixture.detectChanges();

    expect(!inputElement.hasAttribute('disabled')).toBeTruthy('input field is expected to be enabled, i.e. to have no attribute disabled');
  });

  it('should support textColor', () => {
    component.inputConfig.textColor = '#030402';
    fixture.detectChanges();

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.getAttribute('style')).toContain('color: rgb(3, 4, 2)');
  });

  it('should support type being text', () => {
    component.inputConfig.type = InputType.text;
    fixture.detectChanges();

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.hasAttribute('type')).toBeTruthy('input field has type of "text"');
    expect(inputElement.getAttribute('type')).toBe('text');
  });

  it('should support type being number', () => {
    component.inputConfig.type = InputType.number;
    fixture.detectChanges();

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.hasAttribute('type')).toBeTruthy('input field has type of "number"');
    expect(inputElement.getAttribute('type')).toBe('number');
  });

  it('should support placeholder attribute', () => {
    component.inputConfig.placeholder = 'Test text - placeholder';
    fixture.detectChanges();

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.hasAttribute('placeholder')).toBeTruthy('input field has attribute "placeholder"');
    expect(inputElement.getAttribute('placeholder')).toBe('Test text - placeholder', 'The placeholder attrribute should be set to "Test text - placeholder"');
  });

  it('should support autocompleteId attribute', () => {
    const autocompleteId = 'TestLotNumber';
    component.inputConfig.autocompleteId = autocompleteId;
    fixture.detectChanges();

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.hasAttribute('autocompleteId')).toBeTruthy('input field has attribute "autocompleteId"');
    expect(inputElement.getAttribute('autocompleteId')).toBe(autocompleteId, `The autocompleteId attrribute should be set to ${autocompleteId}`);
  });

  describe('ErrorMessage', () => {
    it('should show error message', () => {
      const erroMessage = 'input field has error';
      component.inputConfig.errorMsg = erroMessage;
      fixture.detectChanges();

      const span = debugElement.query(By.css('span'));
      const spanElement = span.nativeElement;

      expect(spanElement).toBeTruthy();
      expect(spanElement.textContent).toBe(erroMessage);
    });

    it('should not show error message', () => {
      const erroMessage = '';
      component.inputConfig.errorMsg = erroMessage;
      fixture.detectChanges();

      const span = debugElement.query(By.css('span'));

      expect(span).toBe(null);
    });

    it('should clear error message on user input', () => {
      // 1st set an error message
      const erroMessage = 'Error message should be removed on user input';
      component.inputConfig.errorMsg = erroMessage;
      fixture.detectChanges();

      let span = debugElement.query(By.css('span'));
      const spanElement = span.nativeElement;

      expect(spanElement).toBeTruthy();
      expect(spanElement.textContent).toBe(erroMessage);

      // 2nd perform user input
      spyOn<any>(component, 'resetErrorMsg').and.callThrough();
      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;

      inputElement.value = 'user';
      inputElement.dispatchEvent(new Event('focus'));

      expect((component as any).resetErrorMsg).toHaveBeenCalled();

      // 3rd check that the error message and value of input has gone
      fixture.detectChanges();
      // update span element
      span = debugElement.query(By.css('span'));
      expect(span).toBe(null);
      expect(inputElement.textContent).toBe('');
    });

    it('should clear error message when onBlur() called', () => {
      const erroMessage = 'Error message should be removed on blur';
      component.inputConfig.errorMsg = erroMessage;
      fixture.detectChanges();

      let span = debugElement.query(By.css('span'));
      const spanElement = span.nativeElement;

      expect(spanElement).toBeTruthy();
      expect(spanElement.textContent).toBe(erroMessage);

      component.onBlur();
      fixture.detectChanges();

      span = debugElement.query(By.css('span'));
      expect(span).toBe(null);
    });
  });

  it('should emit event when press Enter', () => {
    const spy = spyOn(component.carriageReturnEvent, 'emit');

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    inputElement.value = 'user input';
    inputElement.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));

    expect(spy).toHaveBeenCalled();
    expect(inputElement.value).toEqual('user input');
  });

  it('should emit change event when changes are made', () => {
    const expectValueOfInput = 'Input changed';
    const spy = spyOn(component.inputChangeEvent, 'emit');

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    expect(inputElement.value).toEqual('');

    inputElement.value = expectValueOfInput;
    inputElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(inputElement.value).toEqual(expectValueOfInput);
  });

  it('should call selectedEntry when onEnter is called and historyItemIndex is "0"', () => {
    const spy = spyOn<any>(component, 'selectedEntry');
    component.historyItemIndex = 0;
    (component as any).onEnter();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  describe('preventDefault', () => {
    it('should call "preventDefault" in case arrow-up-key is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const spy = spyOn(keyEvent, 'preventDefault');
      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;
      inputElement.dispatchEvent(keyEvent);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('should call "preventDefault" when the key is invalid e.g. "Down"', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'Down' });
      const spy = spyOn(keyEvent, 'preventDefault');

      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;

      component.inputConfig.validCharacterRegexp = /([0-9]|\.)/;
      inputElement.dispatchEvent(keyEvent);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  it('should show the selected value by mouse click', () => {
    const selectedEntryIndex = 1;
    const expectFilteredHistories = ['111111.111', '111111.222'];

    component.filteredHistory = expectFilteredHistories;
    component.onMouseClick(selectedEntryIndex);
    fixture.detectChanges();

    expect(component.inputConfig.value).toEqual(expectFilteredHistories[1]);
  });

  it('should show expected filteredHistory when dispatch keyup event', () => {
    const expectFilteredHistory = ['3333', '33.11'];

    const input = debugElement.query(By.css('input'));
    const inputElement = input.nativeElement;

    component.inputConfig.value = '3';
    (component as any).history = ['3333', '1111', '44', '33.11'];
    inputElement.dispatchEvent(new KeyboardEvent('keyup'));
    fixture.detectChanges();

    expect(component.filteredHistory).toEqual(expectFilteredHistory);
  });

  describe('historyItemIndex', () => {
    it('should set historyItemIndex to "-1" when the event key is invalid e.g. "Up"', () => {
      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;

      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Up' }));
      fixture.detectChanges();

      expect(component.historyItemIndex).toEqual(-1);
    });

    it('should add 1 to historyItemIndex when press ArrowDown', () => {
      const expectedFilteredHistory = ['12345', '131313', '1111'];

      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;

      (component as any).history = ['12345', '44', '3311', '131313', '1111'];
      component.inputConfig.value = '1';
      component.onFocus();
      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(component.filteredHistory).toEqual(expectedFilteredHistory);
      expect(component.historyItemIndex).toEqual(0);

      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(component.historyItemIndex).toEqual(1);
    });

    it('should minus 1 to historyItemIndex when press ArrowUp', () => {
      const expectedFilteredHistory = ['33333', '3311', '313131'];

      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;

      (component as any).history = ['33333', '1111', '3311', '313131', '565656'];
      component.inputConfig.value = '3';
      component.historyItemIndex = 2;
      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
      fixture.detectChanges();

      expect(component.filteredHistory).toEqual(expectedFilteredHistory);
      expect(component.historyItemIndex).toEqual(1);

      // set historyItemIndex to 'filteredHistory.length - 1' when historyItemIndex < 0
      component.historyItemIndex = 0;
      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
      fixture.detectChanges();

      const expectedIndex = component.filteredHistory.length - 1;
      expect(component.historyItemIndex).toEqual(expectedIndex);
    });

    it('should set historyItemIndex to "0" when historyItemIndex greater than the length of filteredHistory', () => {
      const input = debugElement.query(By.css('input'));
      const inputElement = input.nativeElement;

      (component as any).history = ['511', '1111', '511', '554433', '33333'];
      component.inputConfig.value = '5';
      component.historyItemIndex = 3;
      inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }));
      fixture.detectChanges();

      expect(component.filteredHistory.length).toEqual(3);
      expect(component.historyItemIndex).toEqual(0);
    });
  });

  it('should be initialized using initInput function', () => {
    component.inputConfig.initInput('placeholder', true, 'Current Value');
    expect(component.inputConfig.placeholder).toBe('placeholder');
    expect(component.inputConfig.disabled).toBe(true);
    expect(component.inputConfig.value).toBe('Current Value');
  });

  describe('history', () => {
    const history = ['historic one', 'historic two'];
    const autocompleteId = 'test-id';
    beforeEach( async () => {
      await storage.set(autocompleteId, history).toPromise();
    });

    it('should load history from local storage', async () => {
      component.inputConfig.autocompleteId = autocompleteId;
      component.ngOnChanges();
      await of(null).pipe(delay(50)).toPromise();
      fixture.detectChanges();
      expect((component as any).history).toEqual(history);
    });

    describe('insertToHistory', () => {
      it('should call "saveSettings"', () => {
        (component as any).history = ['111', '222'];
        const spyOnSaveSettings = spyOn<any>(component, 'saveSettings');

        component.inputConfig.autocompleteId = 'history_auto';
        (component as any).insertToHistory('123');

        expect(spyOnSaveSettings).toHaveBeenCalled();
      });
    });

    describe('resetErrorMsg', () => {
      it('should call "popFromHistory"', () => {
        (component as any).history = ['111', '222'];
        const spy = spyOn<any>(component, 'popFromHistory');

        component.inputConfig.autocompleteId = 'history_auto';
        component.inputConfig.errorMsg = 'Error';
        (component as any).resetErrorMsg();

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('popFromHistory', () => {
      it('should call "saveSettings"', () => {
        const spy = spyOn<any>(component, 'saveSettings');

        component.inputConfig.autocompleteId = 'history_auto';
        component.inputConfig.errorMsg = 'Error';
        (component as any).popFromHistory();

        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
