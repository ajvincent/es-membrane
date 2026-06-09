export declare const WeakKeyBranding: unique symbol;
export type WeakKeyBranded<Brand extends string> = symbol & { [WeakKeyBranding]: Brand; };
export type PrivateKeyBranded = WeakKeyBranded<"private">;
export type SharedKeyBranded = WeakKeyBranded<"shared">;
