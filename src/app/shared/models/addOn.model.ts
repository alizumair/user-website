export class AddOnModel {
    id: number | string;
    name: string;
    addon_limit: string | number;
    selectedCount: number = 0;
    selected_add_on: number = 0;

    value: Array<{
        id: number | string;
        isSelected: boolean;
        is_default: string;
        is_multiple: number;
        max_adds_on: number;
        min_adds_on: number;
        price: string;
        name: string;
        type_name: string;
        addon_limit: string | number;
        is_mandatory: string;
        adds_on_type_quantity: number;
        quantity: number;
    }>;

    constructor() { }
}
