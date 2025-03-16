import { createComparisonCsv } from './util/csv.ts';
import { fetchFromRotaryOrg } from './get-rotary-org.ts';
import { fetchClubMembers } from './get-rotaract-org.ts';
import process from "node:process"

const ridArg = process.argv.find(arg => arg.startsWith('-rid='));
const rid = ridArg ? ridArg.split('=')[1] : '';

async function main(): Promise<void> {
    // fetch from rotary.org and create the CSV file
    const rotaractPageMembers = await fetchClubMembers();
    const rotaryPageMembers = await fetchFromRotaryOrg(rid);
    createComparisonCsv(rotaryPageMembers!, rotaractPageMembers);
}

await main();
