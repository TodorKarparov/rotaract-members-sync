import { containsCyrillic, translitarate } from './util/translitarate.ts';
import * as cheerio from 'npm:cheerio';
import { parseClubUrls } from './util/parsers.ts';

export type Member = {
    name: string;
    club: string;
    email?: string;
    cyrillicName?: string;
};

export async function fetchClubMembers(): Promise<Member[]> {
    const clubsPage = await getRotaractClubsPage();
    const urls = parseClubUrls(clubsPage);

    const allMembers: Member[] = [];
    for (const url of urls) {
        const response = await fetch(url, {
            headers: {
                accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'cache-control': 'max-age=0',
                priority: 'u=0, i',
                'sec-ch-ua': '"Chromium";v="133", "Not(A:Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
            },
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        $('.section.members .row .profile-card').each((_, el) => {
            const name = $(el).find('.names').text().trim();
            const club = $(el).find('.club').text().trim();
            allMembers.push({ name, club });
        });
    }
    const formattedMembers = allMembers.map((m) => ({
        name: containsCyrillic(m.name) ? translitarate(m.name) : m.name,
        club: m.club.includes('-') ? translitarate(m.club.replaceAll(' ', '')) : translitarate(m.club),
        cyrillicName: containsCyrillic(m.name) ? m.name : undefined,
    })).sort((a, b) => {
        const clubComparison = a.club.localeCompare(b.club);
        return clubComparison !== 0 ? clubComparison : a.name.localeCompare(b.name);
    });

    return formattedMembers;
}


async function getRotaractClubsPage(): Promise<string> {
    const res = await fetch('https://rotaract-bg.org/clubs', {
        'headers': {
            'sec-ch-ua': '"Chromium";v="133", "Not(A:Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'upgrade-insecure-requests': '1',
        },
        'referrer': 'https://rotaract-bg.org/clubs',
        'referrerPolicy': 'strict-origin-when-cross-origin',
        'body': null,
        'method': 'GET',
        'mode': 'cors',
        'credentials': 'omit',
    });

    return await res.text();
}