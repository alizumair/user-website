export class FiltersModel {

  low_to_high: number = 1;
  is_availability: number = 1;
  max_price_range: number = 50000;
  min_price_range: number = 0;
  is_discount: number = 0;
  variant_ids : Array<any> = [];
  brand_ids : Array<any> = [];
  subCategoryId : Array<any> = [];
}