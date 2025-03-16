import Fuse from 'npm:fuse.js';
import { Member } from '../get-rotaract-org.ts';

/**
 * Generates a CSV diff comparing rotaryMembers and rotaractMembers by name & club.
 * Missing entries in one source are shown as "Missing" in the corresponding columns.
 */
export async function createComparisonCsv(
    rotaryMembers: { name: string; email: string; club: string }[],
    rotaractMembers: Member[],
): Promise<void> {
    const makeKey = (name: string, club: string) =>
        `${unifyName(name)}::${unifyClubName(club)}`;

    // Create a lookup map for rotary data
    const rotaryMap = new Map<
        string,
        { name: string; email: string; club: string }
    >();
    const rotarySearchObjects: { name: string; club: string; key: string }[] =
        [];
    for (const r of rotaryMembers) {
        const key = makeKey(r.name, r.club);
        rotarySearchObjects.push({
            name: unifyName(r.name),
            club: unifyClubName(r.club),
            key,
        });
        rotaryMap.set(key, r);
    }

    // Create a lookup map for rotaract data (using transliterated name & club)
    const rotaractMap = new Map<string, Member>();
    const rotaractSearchObjects: { name: string; club: string; key: string }[] =
        [];
    for (const rm of rotaractMembers) {
        const key = makeKey(rm.name, rm.club);
        rotaractSearchObjects.push({
            name: unifyName(rm.name),
            club: unifyClubName(rm.club),
            key,
        });
        rotaractMap.set(key, rm);
    }
    const rotaryKeyFuse = new Fuse(
        rotarySearchObjects,
        {
            keys: [
                { name: 'name' },
            ],
            includeScore: true,
            threshold: 0.7,
        },
    );
    const rotaractKeyFuse = new Fuse(
        rotaractSearchObjects,
        {
            keys: [
                { name: 'name' },
            ],
            includeScore: true,
            threshold: 0.7,
        },
    );
    // Get the union of both sets
    const allKeys = [...rotaryMap.keys(), ...rotaractMap.keys()];

    const header = [
        'Name(rotary.org)',
        'Email(rotary.org)',
        'Club(rotary.org)',
        'Club(rotaract-bg.org)',
        'Name(rotaract-bg.org)',
        'CyrillicName(rotaract-bg.org)',
    ];
    const rows: string[] = [];

    // For each key, gather data from both sets
    const existingRotaryEntries = new Set<string>();
    for (const key of allKeys) {
        const rotaryKeyMatch = rotaryKeyFuse.search(key.split('::')[0])
            .filter((m) => m.item.club === key.split('::')[1])[0]?.item.key ??
            key;
        const r = rotaryMap.get(rotaryKeyMatch);
        const rotaractKeyMatch = rotaractKeyFuse.search(key.split('::')[0])
            .filter((m) => m.item.club === key.split('::')[1])[0]?.item.key ??
            key;
        const rm = rotaractMap.get(rotaractKeyMatch);
        const rotaryEntry = r && r.name + r.email;
        if (!rotaryEntry || !existingRotaryEntries.has(rotaryEntry)) {
            rows.push([
                r?.name || 'Missing',
                r?.email || '-',
                r?.club || 'Missing',
                rm?.club || 'Missing',
                rm?.name || 'Missing',
                rm?.cyrillicName || '',
            ].join(','));
            if (rotaryEntry) {
                existingRotaryEntries.add(rotaryEntry);
            }
        }
    }
    const dateString = new Date().toISOString().split('T')[0];
    const fileName = `memberships-${dateString}.csv`;
    const csvContent = [header.join(','), ...rows].join('\n');
    await Deno.writeTextFile(fileName, csvContent);
}

function unifyClubName(club: string): string {
    const synonyms: Record<string, string> = {
        'bourgas-pyrgos': 'burgas-pirgos',
        'bourgas': 'burgas',
        'bourgasprimorie': 'burgas primorie',
        'dupnitza': 'dupnica',
        'kardjali': 'kardzhali',
        'plovdivphilippopol': 'plovdiv-filipopol',
        'plovdiv-puldin': 'plovdiv-paldin',
        'russe': 'ruse',
        'smoljan': 'smolyan',
        'sofia': 'sofiya',
        'sofiabalkan': 'sofiya-balkan',
        'sofiainternational': 'sofiya-interneshanal',
        'sofiatangra': 'sofiya-tangra',
        'sofia-city': 'sofiya-siti',
        'sofia-serdika': 'sofiya-serdika',
        'sofia-vitosha': 'sofiya-vitosha',
        'sofia-vitosha-izgrev': 'sofiyavitosha-izgrev',
        'varnaeuxinogradinternational': 'varna-evksinograd',
    };
    const normalized = club.toLowerCase().replace(/\s+/g, '');
    const result = synonyms[normalized] || normalized;
    return result;
}

function unifyName(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0] + parts[parts.length - 1]).toLowerCase();
    }
    return name.toLowerCase();
}
