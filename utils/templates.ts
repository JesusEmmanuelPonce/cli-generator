import ejs from 'ejs';

export function render(content: string, data: Record<string, any>): string {
    return ejs.render(content, data);
}
