import * as cheerio from 'npm:cheerio';

export function parseClubUrls(html: string): string[] {
    const $ = cheerio.load(html);
    const urls: string[] = [];
    $('.clubs-grid .item .title a').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
            urls.push(href);
        }
    });
    return urls;
}
