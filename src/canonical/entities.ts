
export interface BaseContact {
    id?: number;
    name: string;
    phone: string;
    email: string;
}

export interface Contact extends BaseContact {
    contacts?: ContactRelative[];
}

export interface ContactReport extends BaseContact {
    contacts: number;
}

export interface ContactRelative extends Contact{
    relationship: string;
}