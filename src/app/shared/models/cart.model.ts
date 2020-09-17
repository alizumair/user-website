import { QuestionsModel } from './questions.model';

export class CartModel {

  deviceId: string = '0';
  productList: CartProductModel[] = [];
  promoationType: string = '0';
  remarks: string = '0';
  supplierBranchId: string = '';
  supplier_id: string = '';
  cartId: string = '0';
  accessToken: string = '';
  latitude: any = 0;
  longitude: any = 0;
  questions: Array<QuestionsModel> = [];
  addOn: number = 0;

  constructor() { }

}

export class CartProductModel {

  handling_admin: string = '';
  handling_supplier: string = '';
  price_type: number = 0;
  supplier_branch_id: string = '';
  supplier_id: string = '';
  quantity: string = '';
  productId: string = '';
  category_id: number = 0;
  agent_type: number = 0;
  price: string = '';
  perProductLoyalityDiscount : number = 0;
  duration: number = 0;

  constructor(obj?: any) {
    if (!obj) { return; }

    this.handling_admin = obj.handling_admin;
    this.handling_supplier = obj.handling_supplier;
    this.price_type = obj.price_type;
    this.supplier_branch_id = obj.supplier_branch_id;
    this.supplier_id = obj.supplier_id;
    this.quantity = obj.quantity;
    this.productId = (obj.productId || obj.product_id || obj.id).toString();
    this.category_id = obj.category_id;
    this.agent_type = obj.agent_type;
    this.price = obj.fixed_price;
    this.perProductLoyalityDiscount = obj.perProductLoyalityDiscount;
    this.duration = obj.duration;
  }

}
export class UpdateCartModel {

  currencyId: string = '';
  netAmount: string = '';
  deliveryId: string = '';
  languageId: string = '';
  minOrderDeliveryCrossed: string = '';
  handlingSupplier: string = '';
  handlingAdmin: string = '';
  delivery_max_time: string = '';
  deliveryDate: string = '';
  deliveryTime: string = '';
  day: string = '';
  deliveryCharges: string = '';
  urgentPrice: string = '0';
  deliveryType: number = 0;
  cartId: string = '';
  accessToken: string = '';
  questions: Array<QuestionsModel> = [];
  addOn: number = 0;
  // offset: string = '';

  constructor() { }

}
