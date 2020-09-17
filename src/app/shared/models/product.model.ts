import { AddOnModel } from './../../shared/models'

export class ProductModel {
  selectedQuantity: number = 0;
  name: string = '';
  productId: string = '';
  supplier_name: string = '';
  delivery_charges: string = '';
  image_path: any = [];
  fixed_price: string = '';
  supplier_branch_id: string = '';
  supplier_id: string = '';
  can_urgent: string = '';
  handling_admin: string = '';
  handling_supplier: string = '';
  price_type: number = 0;
  urgent_value: string = '';
  urgent_type: string = '';
  handingCharges: string = '';
  unitId: string = '';
  categoryId: string = '';
  agent_list: number = 0;
  avg_rating: number = 0;
  id: number = 0;
  is_quantity: number = 0;
  hourly_price: Array<any> = [];
  is_agent: number = 0;
  duration: number = 0;
  is_product: number = 0;
  maxHour: any = '';
  category_flow: string = '';
  customization: Array<customize> = [];
  adds_on: Array<customize> = [];
  from_latitude: number = 0;
  to_latitude: number = 0;
  from_longitude: number = 0;
  to_longitude: number = 0;
  booking_from_date: string = '';
  booking_to_date: string = '';
  from_address: string = '';
  to_address: string = '';
  supplier_address: string = '';
  supplier_logo: string = '';
  distance: number = 0;
  product_desc: string = '';
  latitude: number = 0;
  longitude: number = 0;
  radius_price: number = 0;
  discount: number = 0;
  cart_image_upload: number = 0;
  order_instructions: number = 0;
  agent_slot: any = {};
  payment_after_confirmation: number = 0;

  constructor() { }
}

class customize {
  id: number;
  quantity: number;
  data: Array<AddOnModel>;
}
