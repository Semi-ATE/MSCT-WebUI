import { Component, Input, OnInit } from '@angular/core';
import { CardConfiguration, CardStyle, InformationConfiguration } from 'shared';
import { ElementState, Notice, Status } from '../../models/element-status.models';

export enum Color {
  red = 'red',
  yellow = 'yellow',
  green = 'green'
}

@Component({
  selector: 'app-element-state',
  templateUrl: './element-state.component.html',
  styleUrls: ['./element-state.component.scss']
})
export class ElementStateComponent implements OnInit {
  testcellCardConfiguration: CardConfiguration = new CardConfiguration();
  elementStateConfiguration: InformationConfiguration = new InformationConfiguration();
  testcellNoticeConfiguration: InformationConfiguration = new InformationConfiguration();

  private readonly statusToColor = new Map<Status, Color>(
    [
      [Status.starting, Color.yellow],
      [Status.preloading, Color.green],
      [Status.preloadDone, Color.green],
      [Status.loadingjob, Color.green],
      [Status.unloadingJob, Color.green],
      [Status.postprocessing, Color.green],
      [Status.reloading, Color.green],
      [Status.error, Color.red],
      [Status.busy, Color.green],
      [Status.ready, Color.green],
      [Status.unknown, Color.yellow],
      [Status.crash, Color.red],
    ]);

  @Input() elementState: ElementState;

  constructor() {
    this.elementState = {
      component: '',
      state: Status.unknown,
      notices: [
        {
          message: '',
          priority: 0
        }
      ]
    };
  }

  ngOnInit(): void {
    this.initConfiguration();
  }

  getColor(): Color {
    return this.statusToColor.get(this.elementState.state);
  }

  displayRemainingNoticesCount(): number {
    return this.sortedNotices().length - 1;
  }

  shouldDisplayNotification(): boolean {
    return this.sortedNotices().length > 1;
  }

  getRemainingNotices(): Array<Notice> {
    return this.sortedNotices().slice(1);
  }

  private initConfiguration(): void {
    this.testcellCardConfiguration.initCard(true, CardStyle.COLUMN_STYLE, '');
    this.testcellCardConfiguration.labelText = this.elementState.component ? this.elementState.component : 'Unknown';
    this.elementStateConfiguration.labelText = 'State: ';
    this.elementStateConfiguration.value = this.elementState.state ? this.elementState.state : 'Unknown';
    this.testcellNoticeConfiguration.labelText = 'Notice: ';
    this.testcellNoticeConfiguration.value = this.getHighestPriorityNoticeMessage();
  }

  private getHighestPriorityNoticeMessage(): string {
    return this.sortedNotices()[0] ? this.sortedNotices()[0].message : 'Unknown';
  }

  private sortedNotices(): Array<Notice> {
    return [...this.elementState.notices].sort((p1, p2) => p2.priority - p1.priority);
  }
}
