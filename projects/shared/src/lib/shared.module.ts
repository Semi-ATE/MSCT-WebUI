import { NgModule } from '@angular/core';
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { TableComponent } from './components/table/table.component';
import { TabComponent } from './components/tab/tab.component';
import { MultichoiceComponent } from './components/multichoice/multichoice.component';
import { InformationComponent } from './components/information/information.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { InputComponent } from './components/input/input.component';
@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    DropdownComponent,
    TableComponent,
    TabComponent,
    MultichoiceComponent,
    InformationComponent,
    HeaderComponent,
    FooterComponent,
    InputComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    DropdownComponent,
    TableComponent,
    TabComponent,
    MultichoiceComponent,
    InformationComponent,
    HeaderComponent,
    FooterComponent,
    InputComponent
  ]
})
export class SharedModule { }
