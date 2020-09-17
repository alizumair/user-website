import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { GlobalVariable } from './../../../../../core/global';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';

@Component({
  selector: 'app-agent-tip',
  templateUrl: './agent-tip.component.html',
  styleUrls: ['./agent-tip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentTipComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() tips: Array<number>;
  @Output() addedTip: EventEmitter<any> = new EventEmitter<any>();
  currency: string = '';
  total_tip: number = 0;
  selectedTip: number = -1;

  constructor() {
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() { }

  addTip(tip: number): void {
    if (this.settings.agentTipPercentage == 1) {
      this.total_tip = 0;
      if (this.selectedTip == tip) {
        this.selectedTip = -1;
      } else {
        this.selectedTip = tip;
      }
      this.addedTip.emit({ tip: this.selectedTip > -1 ? tip : 0, isCustom: false });
    } else {
      this.total_tip += tip;
      this.addedTip.emit({ tip: this.total_tip, isCustom: false });
    }
  }

  addCustomTip() {
    this.selectedTip = -1;
    this.addedTip.emit({ tip: this.total_tip, isCustom: true });
  }

  removeTip(): void {
    this.selectedTip = -1;
    this.total_tip = 0;
    this.addedTip.emit({ tip: this.total_tip, isCustom: false });
  }
}
