export interface Playground {
    playground_id: string;
    name: string;
    slug?: string | null;
    is_default: boolean;
    color?: string | null;
    background_color?: string | null;
    icon?: string | null;
}
