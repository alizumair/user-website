
export class PaymentGateway {
    id: string | number;
    name: string;
    is_active: 0 | 1;
    key_value_front: Array<{
        key: string;
        value: string | number;
        for_front: 0 | 1;
    }>
}