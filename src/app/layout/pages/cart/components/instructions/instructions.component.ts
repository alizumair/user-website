import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss']
})
export class InstructionsComponent implements OnInit {

  @Input() title: string = '';
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Output() instructionText: EventEmitter<string> = new EventEmitter<string>(null);

  instructions: string = '';

  constructor() { }

  ngOnInit() {
  }

  onInstructionChange(instruction: string): void {
    this.instructionText.emit(instruction);
  }

}
