export type Address = {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    company: string;
    address1: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    postal_code: string;
    is_default: boolean;
    created_at?: string;
};