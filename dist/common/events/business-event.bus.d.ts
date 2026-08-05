import { Observable } from 'rxjs';
export type BusinessEventType = 'message.received' | 'message.replied' | 'customer.created' | 'customer.updated' | 'lead.created' | 'lead.qualified' | 'cart.created' | 'cart.abandoned' | 'order.created' | 'order.completed' | 'campaign.completed' | 'inventory.low';
export interface BusinessEvent<T = any> {
    id: string;
    type: BusinessEventType;
    shopId: string;
    contactId?: string;
    payload: T;
    timestamp: string;
    idempotencyKey: string;
}
export declare class BusinessEventBus {
    private readonly logger;
    private readonly event$;
    publish<T>(type: BusinessEventType, shopId: string, payload: T, contactId?: string): BusinessEvent<T>;
    on<T>(type: BusinessEventType, shopId?: string): Observable<BusinessEvent<T>>;
    ofShop(shopId: string): Observable<BusinessEvent>;
}
