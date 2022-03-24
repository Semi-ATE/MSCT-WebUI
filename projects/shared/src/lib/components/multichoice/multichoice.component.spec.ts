import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultichoiceComponent } from './multichoice.component';

describe('MultichoiceComponent', () => {
  let component: MultichoiceComponent;
  let fixture: ComponentFixture<MultichoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultichoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultichoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeItem', () => {
    beforeEach(() => {
      component.multichoiceConfig.items = [{
        checked: false,
        backgroundColor: '',
        textColor: '',
        label: ''
      }];
    });

    it('should change the checked state of selected multichoice item', () => {
      component.multichoiceConfig.readonly = true;
      component.changeItem(0);
      fixture.detectChanges();
      expect(component.multichoiceConfig.items[0].checked).toEqual(false);

      component.multichoiceConfig.readonly = false;
      component.changeItem(0);
      fixture.detectChanges();
      expect(component.multichoiceConfig.items[0].checked).toEqual(true);
    });

    it('should emit "multichoiceChangeEvent"', () => {
      const spy = spyOn(component.multichoiceChangeEvent, 'emit');

      component.multichoiceConfig.readonly = false;
      component.changeItem(0);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });
});
