import { SeeMoreComponent } from './components/see-more/see-more.component';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { InnerHtmlSizeLimit } from './pipes/inner-html-size-limit.pipe';
import { FormatTimePipe } from './pipes/format-time.pipe';
import { TimePipe } from './pipes/time.pipe';
import { RestrictSpaceDirective } from './directives/restrict-space.directive';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { AutoCompleteModule } from 'primeng/autocomplete';
// import { RatingModule } from 'ngx-rating';
import { SideBarComponent } from './../../side-bar/side-bar.component';
import { LocationComponent } from './../../common/header/location/location.component';
import { NgModule } from '@angular/core';
import { HomeServiceCategoriesComponent } from '../home/components/home-service-categories/home-service-categories.component';
import { ChatComponent } from './components/chat/chat.component';
import { MultimediaViewerComponent } from './components/multimedia-viewer/multimedia-viewer.component';
import { EmailComponent } from './components/email/email.component';
import { PrescriptionUploadComponent } from './components/prescription-upload/prescription-upload.component';
import { QuestionsComponent } from './components/questions/questions.component';
import { SortingComponent } from './components/sorting/sorting.component';
import { SearchComponent } from '../../common/header/search/search.component';
import { SidebarModule } from 'primeng/sidebar';
import { SupplierCategorySidebarComponent } from './components/supplier-category-sidebar/supplier-category-sidebar.component';;
import { EcomCategoriesComponent } from '../ecom-categories/ecom-categories.component';
import { SupplierSortingComponent } from './components/supplier-sorting/supplier-sorting.component';
import { SupplierCatSortingComponent } from './components/supplier-cat-sorting/supplier-cat-sorting.component';
import { TableDateTimePipe } from './pipes/table-datetime.pipe';
import { CreatePostComponent } from './components/social-ecommerce/create-post/create-post.component';
import { EcommercePostComponent } from './components/social-ecommerce/ecommerce-posts/ecommerce-posts.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { FollowSectionComponent } from './components/social-ecommerce/follow-section/follow-section.component';
import { ProfileOverViewComponent } from './components/social-ecommerce/profile-overview/profile-overview.component';
import { ReportPostComponent } from './components/social-ecommerce/report-post/report-post.component';
import { PostLikesComponent } from './components/social-ecommerce/post-likes/post-likes.component';
import { NativeLoaderComponent } from './components/processing-indicator/native-loader/native-loader.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { TimeSincePipe } from './pipes/time-since.pipe';
import { ImageViewerComponent } from './components/social-ecommerce/image-viewer/image-viewer.component';
import { SmFeedbackFormComponent } from './components/sm-feedback-form/sm-feedback-form.component';
import { CartSharedModule } from './cart-shared/cart-shared.module';
// import { RatingModule } from 'ng-starrating';
import {RatingModule} from 'primeng/rating';


const directives = [
  AutoFocusDirective,
  RestrictSpaceDirective
]

const pipes = [
  TimePipe,
  FormatTimePipe,
  InnerHtmlSizeLimit,
  TableDateTimePipe,
  TimeSincePipe
]

const components = [
  HomeServiceCategoriesComponent,
  ChatComponent,
  MultimediaViewerComponent,
  EmailComponent,
  PrescriptionUploadComponent,
  QuestionsComponent,
  SortingComponent,
  SideBarComponent,
  SupplierCategorySidebarComponent,
  LocationComponent,
  SearchComponent,
  SeeMoreComponent,
  EcomCategoriesComponent,
  SupplierSortingComponent,
  SupplierCatSortingComponent,
  CreatePostComponent,
  EcommercePostComponent,
  FollowSectionComponent,
  ProfileOverViewComponent,
  ReportPostComponent,
  PostLikesComponent,
  NativeLoaderComponent,
  ImageViewerComponent,
  SmFeedbackFormComponent
]

@NgModule({
  declarations: [
    ...components,
    ...pipes,
    ...directives
  ],
  imports: [
    RatingModule,
    SidebarModule,
    PickerModule,
    AutoCompleteModule,
    MultiSelectModule,
    DropdownModule,
    ShareButtonsModule.withConfig({
      debug: true
    }),
    ShareIconsModule,
    SlickCarouselModule,
    CartSharedModule
  ],
  exports: [
    RatingModule,
    SidebarModule,
    AutoCompleteModule,
    CartSharedModule,
    ...components,
    ...pipes,
    ...directives
  ],
  entryComponents: [
    QuestionsComponent,
    EmailComponent,
    MultimediaViewerComponent,
    PrescriptionUploadComponent
  ]
})
export class LayoutSharedModule { }
