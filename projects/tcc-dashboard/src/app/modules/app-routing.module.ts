import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ElementsOverviewComponent } from '../components/elements-overview/elements-overview.component';
import { LoggingComponent } from '../components/logging/logging.component';

export enum TccMenuItem {
  Info = 'information',
  Logging = 'logging'
}

const TCC_DASHBOARD_ROUTES: Routes = [
  {path: '', redirectTo: TccMenuItem.Info, pathMatch: 'full'},
  {path: TccMenuItem.Info, component: ElementsOverviewComponent},
  {path: TccMenuItem.Logging, component: LoggingComponent},
  {path: '**', redirectTo: TccMenuItem.Info}
];

@NgModule({
  imports: [RouterModule.forRoot(TCC_DASHBOARD_ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
