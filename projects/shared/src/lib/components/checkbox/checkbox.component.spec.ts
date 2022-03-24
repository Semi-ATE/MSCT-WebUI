import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckboxComponent ],
      imports: [ FormsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be initialized using initCheckBox function', () => {
    expect(component.checkboxConfig.labelText).toEqual('');
    expect(component.checkboxConfig.checked).toEqual(false);
    expect(component.checkboxConfig.disabled).toEqual(false);

    component.checkboxConfig.initCheckBox('label', true, false);
    expect(component.checkboxConfig.labelText).toBe('label');
    expect(component.checkboxConfig.checked).toBe(true);
    expect(component.checkboxConfig.disabled).toBe(false);
  });

  it('should emit dropdownChangeEvent when "checkboxValueChange" called', () => {
    const spy = spyOn(component.checkboxChangeEvent, 'emit');
    component.checkboxValueChange(true);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
