import { PaymentGateway } from './payment-gateway.model';

export class ApiKeys {
  public google_maps: string = '';
  public dialogflow_token: string = '';
  public tawk_site_id: string = '';
  public hijiffy_token: string = '';
  public paymentGateways: Array<PaymentGateway>;
  public gtm: string = '';
  public facebook_pixel_id: string = '';
  public pinterest_content_id: string = '';
  public zendesk_key: string = '';
  public oribi_analytics: string = '';
  public segment_key: string = '';
  public google_search_content_id: string = '';
}


