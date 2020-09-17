import { GlobalVariable } from './../../core/global';
export class AppSettings {

  public app_type: number;
  public type: number;
  public countryISO: string;
  public webMetaDescription: string;
  public admin_order_priority: number;
  public cart_flow: number;
  public branch_flow: number;
  public is_pickup_order: number;
  public is_scheduled: number;
  public schedule_time: number;
  public vendor_status: number;
  public is_social_module: number;
  public booking_track_status: number;
  public interval: number;
  public temp_banners: Array<{ display_image: string, website_image: string }>;
  public site_logo: string;
  public android_app_url: string;
  public ios_app_url: string;
  public app_color: string;
  public payment_method: string;
  public is_single_vendor: number;
  public single_vendor_id: number;
  public hasDafaultAddrees: boolean;
  public terminology: object;
  public privacyPolicy: number;
  public termsAndConditions: number;
  public aboutUs: number;
  public faqs: number;
  public template_section: number;
  public referral_feature: number;
  public chat_enable: number;
  public search_by: number;
  public referral_given_price: string | number;
  public referral_receive_price: string | number;
  public delivery_charge_type: number;
  public supplier_service_fee: number;
  public cart_image_upload: number;
  public order_instructions: number;
  public email: number | string;
  public header_theme: number;
  public isCustomFlow: boolean = false;
  public dynamic_home_section: number;
  public selected_template: number;
  public tag_search: number = 0;
  public user_register_flow: number;
  public service_booking_flow: number = 0;
  public gift_card: number;
  public extra_instructions: number = 0;
  public agent_tip: number = 0;
  public secondary_language: any = 0;
  public things_to_remember: string = '';
  public product_detail: number = 0;
  public bypass_otp: number = 0;
  public payment_card_images: number = 0;
  public is_return_request: number = 0;
  public delivery_distance_unit: number = 0
  public show_prescription_requests: number = 0;
  public category_selection: number = 0;
  public footer_type: number = 0;
  public is_tax_geofence: number = 0;
  public isProductCustomTabDescriptionEnable: number = 0;
  public productCustomTabDescriptionLabel: any = [];
  public laundary_service_flow: number = 0;
  public is_product_wishlist: number = 0;
  public is_supplier_wishlist: number = 0;
  public is_agent_rating: number = 0;
  public is_supplier_rating: number = 0;
  public is_product_rating: number = 0;
  public addCollectFieldInAddress: number = 0;
  public social_media_icons: number = 0;
  public product_prescription: number = 0;
  public categories_above_supplier: number = 0;
  public single_vendor_popular_text: string = '';
  public single_vendor_offer_text: string = '';
  public is_dine_in: number = 0;
  public user_id_proof: number = 0;
  public disable_tax: number = 0;
  public disable_user_cancel_order: number = 0;
  public is_user_subscription: number = 0;
  public singleFoodStoryBackground: number = 0;
  public agentTipPercentage: number = 0;
  public is_loyality_enable: number = 0;
  public is_feedback_form_enabled: number = 0;
  public is_product_weight: number = 0;
  public hideAgentList: number = 0;
  public addon_type_quantity: number = 0;
  public no_default_product_sort: number = 0;
  public logo_background_color: number = 0;

  public not_all_variant_required: number = 0;
  public hide_supplier_timing: number = 0;
  public hide_supplier_delivery_time: number = 0;
  public web_custom_domain_theme: number = 0;
  public is_vendor_registration: number = 0;
  public ecom_agent_module: number = 0;
  public price_decimal_length: number = 2;
  public show_expected_delivery_between: number = 0;
  public is_product_border: number = 0;
  public category_popup_width: number = 250;
  public disable_zoom_in_product: number = 0;
  public separate_images_product_detail: number = 0;
  public show_barcode: number = 0;
  public setlogoHeight: number = 0;
  public logoHeight: number = 0;
  public hide_offers_category_home: number = 0;
  public wallet_module: number = 0;
  public is_unify_search: number = 0;
  public is_decimal_quantity_allowed: number = 0;
  public is_social_ecommerce: number = 0;
  public hide_supplier_address: number = 0;

  public footer_mockup_image: string = '';
  public footer_mockup_title: string = '';
  public footer_mockup_description: string = '';
  public fackbook_link: string = '';
  public twitter_link: string = '';
  public google_link: string = '';
  public linkedin_link: string = '';
  public instagram_link: string = '';
  public youtube_link: string = '';

  public is_schdule_order: number = 0;
  public payment_through_wallet_discount: number = 0;
  public default_language: number = 0;
  public isFirebaseAnalytics: string = "0";
  public admin_to_user_chat: number = 0;
  public is_segment: string = "0";
  public supplier_to_user_chat: number = 0;
  public is_branch_image_optional: number = 0;
  public agent_android_app_url: string = '';
  public agent_ios_app_url: string = '';
  public can_user_edit: string = '';
  public is_enabled_multiple_base_delivery_charges: number = 0;
  public hide_supplier_phone_email: string = '';
  public is_currency_exchange_rate: number = 0;
  public show_wallet_on_home: number = 0;
  public agent_verification_code_enable: number = 0;

  public singleVendorBottomBanner: any = {};

  public by_pass_tables_selection: string = "0";
  public is_table_booking: string = "0";
  public is_table_invite_allowed: string = "0";
  public is_coin_exchange: number = 0;
  public is_abn_business: string = "0";
  public table_booking_add_food_allow: string = "0";

  public is_sos_allow: string = "0";
  public is_survey_monkey_allow: string = "0";

  public content_id: string = "0";

  public is_custom_category_template: string = "0";


  public appStyle?: {
    headerBackgroundColor?: string;
    headerTextColor?: string;
    topHeaderTextColor?: string;
    topHeaderBackgroundColor?: string;
    headerFontFamily?: string;
    primaryColor?: string;
    baseColor?: string;
  };

  public logo?: {
    background?: string;
    thumb_url?: string;
    url?: string
  };

  public placeholder: Placeholder;
  public card_gateway: object = {};


  public descriptionSections: Array<{
    title?: string;
    description?: string;
    image?: string;
  }>;

  public default_address?: {
    address?: string,
    latitude?: number
    longitude?: number
  };

  public phone_registration_flag: number;

  constructor(settingObj: any) {
    if (settingObj) {
      this.app_type = settingObj['app_type'];
      this.type = settingObj['app_type'];
      this.countryISO = settingObj['iso'];
      this.webMetaDescription = settingObj['web_meta_description'] || '';
      this.admin_order_priority = settingObj['admin_order_priority'];
      this.cart_flow = settingObj['cart_flow'];
      this.branch_flow = settingObj['branch_flow'] || 0;
      this.is_pickup_order = settingObj['is_pickup_order'];
      this.is_scheduled = settingObj['is_scheduled'];
      this.schedule_time = settingObj['schedule_time'];
      this.vendor_status = settingObj['vendor_status'];
      this.booking_track_status = settingObj['booking_track_status'];
      this.is_social_module = settingObj['is_social_module'];
      this.interval = settingObj['interval'];
      this.android_app_url = settingObj['android_app_url'];
      this.app_color = settingObj['app_color'];
      this.ios_app_url = settingObj['ios_app_url'];
      this.site_logo = settingObj['logo_url'];
      this.payment_method = settingObj['payment_method'];
      this.is_single_vendor = settingObj['is_single_vendor'];
      this.single_vendor_id = settingObj['single_vendor_id'];
      this.termsAndConditions = settingObj['termsAndConditions'];
      this.privacyPolicy = settingObj['privacyPolicy'];
      this.aboutUs = settingObj['aboutUs'];
      this.faqs = settingObj['faqs'];
      this.template_section = !!settingObj['template_section'] ? parseInt(settingObj['template_section']) : 0;
      this.referral_feature = settingObj['referral_feature'] || 0;
      this.search_by = settingObj['search_by'] ? parseInt(settingObj['search_by']) : 0;
      this.chat_enable = settingObj['chat_enable'];
      this.referral_given_price = settingObj['referral_given_price'] || 0;
      this.referral_receive_price = settingObj['referral_receive_price'] || 0;
      this.delivery_charge_type = settingObj['delivery_charge_type'] || 0;
      this.supplier_service_fee = settingObj['user_service_fee'] || 0;
      this.cart_image_upload = settingObj['cart_image_upload'] || 0;
      this.order_instructions = settingObj['order_instructions'] || 0;
      this.email = settingObj['email'] || 0;
      this.header_theme = settingObj['header_theme'] || 0;
      this.dynamic_home_section = settingObj['dynamic_home_section'] || 0;
      this.selected_template = !!settingObj['selected_template'] ? parseInt(settingObj['selected_template']) : 0;
      this.phone_registration_flag = settingObj['phone_registration_flag'] || 0;
      this.tag_search = settingObj['tag_search'] || 0;
      this.card_gateway = settingObj['card_gateway'] ? jsonParser(settingObj['card_gateway']) : {};
      this.user_register_flow = !!settingObj['user_register_flow'] ? parseInt(settingObj['user_register_flow']) : 0;
      this.descriptionSections = settingObj['description_sections'] ? jsonParser(settingObj['description_sections']) : [];
      this.service_booking_flow = settingObj['service_booking_flow'] || 0;
      this.gift_card = settingObj['gift_card'] || 0;
      this.things_to_remember = settingObj['things_to_remember'] || '';
      this.extra_instructions = settingObj['extra_instructions'] || 0;
      this.secondary_language = settingObj['secondary_language'] || 0;
      this.agent_tip = settingObj['agent_tip'] || 0;
      this.product_detail = settingObj['product_detail'] || 0;
      this.bypass_otp = settingObj['bypass_otp'] || 0;
      this.payment_card_images = settingObj['payment_card_images'] || 0;
      this.is_return_request = settingObj['is_return_request'] || 0;
      this.delivery_distance_unit = settingObj['delivery_distance_unit'] || 0;
      this.show_prescription_requests = settingObj['show_prescription_requests'] || 0;
      this.category_selection = settingObj['category_selection'] || 0;
      this.footer_type = settingObj['footer_type'] || 0;
      this.is_tax_geofence = settingObj['is_tax_geofence'] || 0;
      this.isProductCustomTabDescriptionEnable = settingObj['isProductCustomTabDescriptionEnable'] || 0;
      this.social_media_icons = settingObj['social_media_icons'] || 0;
      this.product_prescription = settingObj['product_prescription'] || 0;
      this.categories_above_supplier = settingObj['categories_above_supplier'] || 0;
      this.is_dine_in = settingObj['is_dine_in'] || 0;
      this.user_id_proof = settingObj['user_id_proof'] || 0;
      this.disable_tax = settingObj['disable_tax'] || 0;
      this.is_user_subscription = settingObj['is_user_subscription'] || 0;
      this.agentTipPercentage = settingObj['agentTipPercentage'] || 0;
      this.is_loyality_enable = settingObj['is_loyality_enable'] || 0;
      this.is_feedback_form_enabled = settingObj['is_feedback_form_enabled'] || 0;
      this.is_product_weight = settingObj['is_product_weight'] || 0;
      this.admin_to_user_chat = settingObj['admin_to_user_chat'] || 0;
      this.supplier_to_user_chat = settingObj['supplier_to_user_chat'] || 0;
      this.can_user_edit = settingObj['can_user_edit'] || 0;
      this.hideAgentList = settingObj['hideAgentList'] || 0;
      this.addon_type_quantity = settingObj['addon_type_quantity'] || 0;
      this.is_unify_search = settingObj['is_unify_search'] || 0;
      this.is_decimal_quantity_allowed = settingObj['is_decimal_quantity_allowed'] || 0;
      this.is_social_ecommerce = settingObj['is_social_ecommerce'] || 0;
      this.is_enabled_multiple_base_delivery_charges = settingObj['is_enabled_multiple_base_delivery_charges'] || 0;
      this.hide_supplier_phone_email = settingObj['hide_supplier_phone_email'] || 0;
      this.is_currency_exchange_rate = settingObj['is_currency_exchange_rate'] || 0;
      this.show_wallet_on_home = settingObj['show_wallet_on_home'] || 0;
      this.agent_verification_code_enable = settingObj['agent_verification_code_enable'] || 0;
      this.hide_supplier_address = settingObj['hide_supplier_address'] || 0;
      this.no_default_product_sort = settingObj['no_default_product_sort'] || 0;
      this.logo_background_color = settingObj['logo_background_color'] || 0;

      if (settingObj['productCustomTabDescriptionLabel']) {
        this.productCustomTabDescriptionLabel = jsonParser(settingObj['productCustomTabDescriptionLabel']);
      }
      this.laundary_service_flow = settingObj['laundary_service_flow'] || 0;
      this.web_custom_domain_theme = settingObj['web_custom_domain_theme'] || 0;
      this.ecom_agent_module = settingObj['ecom_agent_module'] || 0;

      this.is_product_wishlist = settingObj['is_product_wishlist'] || 0;
      this.is_supplier_wishlist = settingObj['is_supplier_wishlist'] || 0;

      this.is_agent_rating = settingObj['is_agent_rating'] || 0;
      this.is_supplier_rating = settingObj['is_supplier_rating'] || 0;
      this.is_product_rating = settingObj['is_product_rating'] || 0;

      this.addCollectFieldInAddress = settingObj['addCollectFieldInAddress'] || 0;
      this.hide_supplier_timing = settingObj['hide_supplier_timing'] || 0;
      this.hide_supplier_delivery_time = settingObj['hide_supplier_delivery_time'] || 0;
      this.wallet_module = settingObj['wallet_module'] || 0;

      this.show_expected_delivery_between = settingObj['show_expected_delivery_between'] || 0;
      this.is_schdule_order = settingObj['is_schdule_order'] || 0;
      this.not_all_variant_required = settingObj['not_all_variant_required'] || 0;
      this.is_product_border = settingObj['is_product_border'] || 0;
      this.category_popup_width = settingObj['category_popup_width'] || 250;
      this.disable_zoom_in_product = settingObj['disable_zoom_in_product'] || 0;
      this.separate_images_product_detail = settingObj['separate_images_product_detail'] || 0;
      this.show_barcode = settingObj['show_barcode'] || 0;
      this.setlogoHeight = settingObj['setlogoHeight'] || 0;
      this.logoHeight = settingObj['logoHeight'] || 0;
      this.disable_user_cancel_order = settingObj['disable_user_cancel_order'] || 0;

      this.payment_through_wallet_discount = settingObj['payment_through_wallet_discount'] ? parseInt(settingObj['payment_through_wallet_discount']) : 0;
      this.default_language = settingObj['default_language'] ? parseInt(settingObj['default_language']) : 0;
      this.hide_offers_category_home = settingObj['hide_offers_category_home'] || 0;

      this.is_vendor_registration = settingObj['is_vendor_registration'] || 0;
      this.price_decimal_length = settingObj['price_decimal_length'] ? parseInt(settingObj['price_decimal_length']) : 2;

      this.footer_mockup_image = settingObj['footer_mockup_image'] || '';
      this.footer_mockup_title = settingObj['footer_mockup_title'] || '';
      this.footer_mockup_description = settingObj['footer_mockup_description'] || '';
      this.fackbook_link = settingObj['fackbook_link'] || '';
      this.twitter_link = settingObj['twitter_link'] || '';
      this.google_link = settingObj['google_link'] || '';
      this.linkedin_link = settingObj['linkedin_link'] || '';
      this.instagram_link = settingObj['instagram_link'] || '';
      this.youtube_link = settingObj['youtube_link'] || '';
      this.is_branch_image_optional = settingObj['is_branch_image_optional'] || 0;
      this.agent_android_app_url = settingObj['agent_android_app_url'] || '';
      this.agent_ios_app_url = settingObj['agent_ios_app_url'] || '';

      this.single_vendor_popular_text = settingObj['single_vendor_popular_text'] || '';
      this.single_vendor_offer_text = settingObj['single_vendor_offer_text'] || '';
      this.singleFoodStoryBackground = settingObj['singleFoodStoryBackground'] || '';
      this.singleVendorBottomBanner = {
        banner1: settingObj['singleFoodBottomBanner1'] || '',
        banner2: settingObj['singleFoodBottomBanner2'] || ''
      }

      const placeholder = {};
      if (settingObj['user_location']) {
        placeholder['user_location'] = jsonParser(settingObj['user_location']);
      }

      if (settingObj['empty_cart']) {
        placeholder['empty_cart'] = jsonParser(settingObj['empty_cart']);
      }

      if (settingObj['order_loader']) {
        placeholder['order_loader'] = jsonParser(settingObj['order_loader']);
      }

      if (settingObj['website_background']) {
        placeholder['website_background'] = jsonParser(settingObj['website_background']);
      }

      this.placeholder = new Placeholder(placeholder);

      if (settingObj['terminology']) {
        try {
          this.terminology = JSON.parse(settingObj['terminology']);
        } catch {
          this.terminology = {};
        }
      }

      this.appStyle = {
        baseColor: settingObj['element_color'],
        primaryColor: settingObj['theme_color'],
        headerFontFamily: settingObj['font_family'],
        headerBackgroundColor: settingObj['header_color'],
        headerTextColor: settingObj['header_text_color'],
        topHeaderBackgroundColor: settingObj['header_color'],
        topHeaderTextColor: settingObj['header_text_color']
      };

      this.logo = {
        background: settingObj['logo_background'],
        url: settingObj['logo_url'],
        thumb_url: settingObj['logo_thumb_url']
      }

      this.temp_banners = [
        { display_image: settingObj['banner_one_thumb'], website_image: settingObj['banner_one'] },
        { display_image: settingObj['banner_two_thumb'], website_image: settingObj['banner_two'] },
        { display_image: settingObj['banner_three_thumb'], website_image: settingObj['banner_three'] },
        { display_image: settingObj['banner_four_thumb'], website_image: settingObj['banner_four'] }
      ];

      // if (!!settingObj['banner_url']) {
      //   this.temp_banners.unshift({
      //     display_image: settingObj['banner_thumb_url'],
      //     website_image: settingObj['banner_url']
      //   });
      // }

      if (GlobalVariable.flowData && GlobalVariable.flowData.length) {
        if (GlobalVariable.flowData.length > 1) {
          this.isCustomFlow = true;
        } else {
          this.app_type = GlobalVariable.flowData[0].flow_type;
          this.isCustomFlow = false;
        }
      }

      if (settingObj.default_address) {
        this.default_address = {
          address: settingObj['default_address']['address'],
          latitude: settingObj['default_address']['latitude'],
          longitude: settingObj['default_address']['longitude']
        }
      }

      this.isFirebaseAnalytics = settingObj['isFirebaseAnalytics'] || "0";
      this.is_segment = settingObj['is_segment'] || "0";
      this.by_pass_tables_selection = settingObj['by_pass_tables_selection'] || "0";
      this.is_table_booking = settingObj['is_table_booking'] || "0";
      this.is_table_invite_allowed = settingObj['is_table_invite_allowed'] || "0";
      this.is_coin_exchange = settingObj['is_coin_exchange'] || 0;
      this.is_abn_business = settingObj['is_abn_business'] || "0";
      this.table_booking_add_food_allow = settingObj['table_booking_add_food_allow'] || "0";
      this.is_sos_allow = settingObj['is_sos_allow'] || "0";
      this.is_survey_monkey_allow = settingObj['is_survey_monkey_allow'] || "0";

      this.content_id = settingObj['content_id'] || "0";

      this.is_custom_category_template = settingObj['is_custom_category_template'] || "0";

    }
  }
}

class Placeholder {
  user_location: PlaceholderKey;
  empty_cart: PlaceholderKey;
  order_loader: PlaceholderKey;
  website_background: PlaceholderKey;

  constructor(obj?: any) {
    if (!obj) return;
    this.user_location = new PlaceholderKey(obj.user_location)
    this.empty_cart = new PlaceholderKey(obj.empty_cart)
    this.order_loader = new PlaceholderKey(obj.order_loader)
    this.website_background = new PlaceholderKey(obj.website_background)
  }

}

class PlaceholderKey {
  id: number;
  app: string;
  web: string;
  constructor(obj?: any) {
    if (!obj) return;
    this.id = obj.id;
    this.app = obj.app;
    this.web = obj.web;
  }
}


function jsonParser(json: string) {
  if (!json) return;
  try {
    return JSON.parse(json);
  } catch (err) {
    return;
  }
}
