import { ImageCompressionPipe } from './pipes/image-compression.pipe';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { QuicklinkModule } from 'ngx-quicklink';

/*************************** Directives *****************************/
import { GoogleplaceDirective } from './directives/googleplace.directive';

/*************************** Pipes *******************************/
import { LocalizationPipe } from './pipes/localization.pipe';
import { SafePipe } from './pipes/safe-DOM.pipe';
import { ImageCompressionDirective } from './directives/image-compression.directive';


const directives = [
  GoogleplaceDirective,
  ImageCompressionDirective
]

const pipes = [
  SafePipe,
  LocalizationPipe,
  ImageCompressionPipe
]


@NgModule({
  declarations: [
    ...pipes,
    ...directives
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    QuicklinkModule
  ],
  exports: [
    FormsModule,
    TranslateModule,
    ...directives,
    ...pipes
  ],
  providers: [
    LocalizationPipe,
    MessageService
  ]
})
export class SharedModule { }
