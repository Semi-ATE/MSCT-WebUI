import { Component, Input } from '@angular/core';
import { initMultichoiceEntry, MultichoiceConfiguration, MultichoiceEntry } from 'shared';
import { StdfRecord, StdfRecordType, getStdfRecordDescription, Stdf, stdfGetValue, STDF_RECORD_ATTRIBUTES, computePassedInformationForTestFlag } from './../stdf/stdf-stuff';

@Component({
  selector: 'app-stdf-record',
  templateUrl: './stdf-record.component.html',
  styleUrls: ['./stdf-record.component.scss']
})
export class StdfRecordComponent {
  @Input()
  stdfRecord: StdfRecord;

  constructor() {
    this.stdfRecord  = {
      type: StdfRecordType.Unknown,
      values: []
    };
  }

  getLongType(): string {
    return getStdfRecordDescription(this.stdfRecord);
  }

  getScaledResult(): string {
    return Stdf.computeScaledResultFromSTDF(this.stdfRecord);
  }

  getScaledLowLimit(): string {
    return Stdf.computeScaledLowLimitFromSTDF(this.stdfRecord);
  }

  getScaledHighLimit(): string {
    return Stdf.computeScaledHighLimitFromSTDF(this.stdfRecord);
  }

  getPassStatus(): string {
    const passStatus = computePassedInformationForTestFlag(stdfGetValue(this.stdfRecord, STDF_RECORD_ATTRIBUTES.TEST_FLG) as number);
    if (passStatus === true) {
      return 'P';
    } else {
      return 'F';
    }
  }

  getPassOrFailTextColor(): string {
    if (this.getPassStatus() === 'P') {
      return '#0AC473';
    } else {
      return '#BD2217';
    }
  }

  getTestNumber(): number {
    const testNumber = stdfGetValue(this.stdfRecord, STDF_RECORD_ATTRIBUTES.TEST_NUM) as number;
    return testNumber;
  }

  getHeadNumber(): number {
    const headNumber = stdfGetValue(this.stdfRecord, STDF_RECORD_ATTRIBUTES.HEAD_NUM) as number;
    return headNumber;
  }

  getSiteNumber(): string {
    const siteNumber = stdfGetValue(this.stdfRecord, STDF_RECORD_ATTRIBUTES.SITE_NUM) as number;
    return this.siteNumberToLetter(siteNumber);
  }

  getTestText(): string {
    const testText = stdfGetValue(this.stdfRecord, STDF_RECORD_ATTRIBUTES.TEST_TXT) as string;
    return testText;
  }

  getTestFlag(): number {
    return stdfGetValue(this.stdfRecord, STDF_RECORD_ATTRIBUTES.TEST_FLG) as number;
  }

  private siteNumberToLetter(siteNumber: number): string {
    let s: string;
    let t: number;
    if (siteNumber === 0) {
      return 'A';
    } else if (siteNumber > 0 && siteNumber < 17) {
      while (siteNumber) {
        t = (siteNumber - 1) % 26;
        s = String.fromCharCode(66 + t);
        siteNumber = (siteNumber - t) / 26 | 0;
      }
      return s;
    } else {
      return undefined;
    }
  }

  computeMultichoiceConfigurationForTestFlagValue(testFlag: number): MultichoiceConfiguration {
    const bitEncoding = [...Array(8)].map( (_x , i ) => (testFlag >> i ) & 1 );
    const label = 'Test Flag: ';
    const readonly = true;
    const items = new Array<MultichoiceEntry>();

    for (let idx = 0; idx < bitEncoding.length; idx++) {
      items.push(
        initMultichoiceEntry(
          this.getTestflagBitDescription(idx),
          bitEncoding[idx] !== 0,
          bitEncoding[idx] === 0 ? '#0AC473' : '#BD2217',
          '#0046AD')
      );
    }

    return {
      readonly,
      items,
      label
    };
  }

  private getTestflagBitDescription(bitPosition: number): string {
    switch (bitPosition) {
      case 0:
        return 'Alarm';
      case 1:
        return 'Result field valid';
      case 2:
        return 'Test is reliable';
      case 3:
        return 'Timeout';
      case 4:
        return 'Test was executed';
      case 5:
        return 'Test aborted';
      case 6:
        return 'Pass/fail flag is valid';
      case 7:
        return 'Test passed';
      default:
        return 'unknown';
    }
  }
}
