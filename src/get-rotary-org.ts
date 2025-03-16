export type MemberSearchResponse = {
    data: {
        members: {
            totalCount: number;
            results: MemberSearchResult[];
            __typename: string;
        };
    };
};

type MemberSearchResult = {
    name: string;
    email: string;
    onlineId: string | null;
    activeMemberships: ActiveMembership[];
    activeLeaderships: Leadership[];
    nameWithPrefixSuffix: string;
    thisDistrictLeadership: Leadership[];
    associatedClubsInfo: AssociatedClubsInfo[];
};

type ActiveMembership = {
    type: string;
    clubName: string;
    clubId: string;
    admissionDate: string;
    terminationDate: string | null;
    __typename: string;
};

type Leadership = {
    role: string;
    clubName: string;
    clubId: string;
    __typename: string;
};

type AssociatedClubsInfo = {
    clubId: string;
    clubName: string;
    clubType: string;
    physicalLocation: BaseAddress;
    __typename: string;
};

type BaseAddress = {
    country: string;
    city: string | null;
    state: string | null;
    internationalProvince: string | null;
    __typename: string;
};

async function getRotaractMembersRotaryOrg(
    rid: string,
    pageSize: number = 10,
): Promise<MemberSearchResult[]> {
    let page = 1;
    const results: MemberSearchResult[] = [];
    let totalCount;
    while (true) {
        const resp = await fetchMembers(page, pageSize, rid);
        const json: MemberSearchResponse = await resp.json();
        if (!totalCount) totalCount = json.data.members.totalCount;
        results.push(...json.data.members.results);
        if (page++ >= Math.ceil(json.data.members.totalCount / pageSize)) break;
    }
    console.log(`Members total count: ${totalCount}`);
    console.log(`Members retrieved: ${results.length}`);

    return results;
}

export const fetchFromRotaryOrg = async (rid: string) => {
    const memberSearchResults = await getRotaractMembersRotaryOrg(rid, 100);
    try {
        const rotaryOrgEntrues = memberSearchResults
            .map((m) => ({
                name: m.name.replace(/^\s*(?:mr\.?|ms\.?|mrs\.?|phd)\.?\s+/i, '').trim(),
                email: m.email || m.onlineId || '',
                club: m.activeMemberships[0].clubName,
            }))
            .sort((a, b) => {
                const clubComparison = a.club.localeCompare(b.club);
                return clubComparison !== 0
                    ? clubComparison
                    : a.name.localeCompare(b.name);
            });
            return rotaryOrgEntrues;
    } catch (err) {
        console.error('JSON parse error:', err);
    }
};

const fetchMembers = async (
    page: number = 1,
    pageSize: number = 10,
    rid: string,
) => {
    console.log(`Fetching page ${page} with pageSize ${pageSize}`);
    return await fetch('https://my-api.rotary.org/api/graphql', {
        headers: {
            accept: '*/*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'content-type': 'application/json',
            'language-context': 'en',
            priority: 'u=1, i',
            'sec-ch-ua': '"Chromium";v="133", "Not(A:Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            cookie:
                `AMCVS_6E43BF115751AA767F000101%40AdobeOrg=1; ApplicationGatewayAffinityCORS=9484d7697631080f8278a6e917e10b9d; ApplicationGatewayAffinity=9484d7697631080f8278a6e917e10b9d; rid=${rid}; AMCV_6E43BF115751AA767F000101%40AdobeOrg=870038026%7CMCIDTS%7C20163%7CMCMID%7C36931924484304216656481342764055551780%7CMCAID%7CNONE%7CMCOPTOUT-1742072784s%7CNONE%7CvVersion%7C5.0.0`,
        },
        referrer: 'https://my.rotary.org/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: JSON.stringify({
            ...requestBody,
            variables: { ...requestBody.variables, page, pageSize },
        }),
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
    });
};

const requestBody = {
    operationName: 'fetchDistrictMembers',
    variables: {
        page: 1,
        pageSize: 100,
        name: '',
        email: '',
        isIncludedDistrictLeadership: false,
        isIncludedDistrictMembership: true,
        clubNames: [],
        clubIds: [],
        districtRoles: [],
        memberTypes: ['Rotaractor'],
        rolesToExclude: [],
        district: '2482',
        yearRange: [],
        includeDLHistory: false,
    },
    query:
        'query fetchDistrictMembers($district: String, $page: Int = 1, $pageSize: Int = 10, $name: String = "", $email: String = "", $isIncludedDistrictLeadership: Boolean = true, $isIncludedDistrictMembership: Boolean = true, $clubNames: [String] = [], $clubIds: [String] = [], $districtRoles: [String] = [], $memberTypes: [String] = [], $allowRotaractors: Boolean, $rolesToExclude: [String] = [], $rotaryYear: String, $individualId: String, $yearRange: [Int!], $includeDLHistory: Boolean, $isDeceased: Boolean) {\n  members: memberSearchAdvanced(\n    district: $district\n    pageSize: $pageSize\n    page: $page\n    name: $name\n    email: $email\n    isIncludedDistrictLeadership: $isIncludedDistrictLeadership\n    isIncludedDistrictMembership: $isIncludedDistrictMembership\n    clubNames: $clubNames\n    clubIds: $clubIds\n    districtRoles: $districtRoles\n    memberTypes: $memberTypes\n    allowRotaractors: $allowRotaractors\n    rolesToExclude: $rolesToExclude\n    rotaryYear: $rotaryYear\n    individualId: $individualId\n    yearRange: $yearRange\n    includeDLHistory: $includeDLHistory\n    isDeceased: $isDeceased\n  ) {\n    totalCount\n    results {\n      ...MemberSearchRow\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment MemberSearchRow on MemberSearchResult {\n  id\n  name\n  localizedName\n  email\n  location\n  photoUri\n  phoneNumber\n  onlineId\n  riIndividualId\n  activeMemberships(riClubId: "") {\n    type\n    clubName\n    clubId\n    admissionDate\n    terminationDate\n    __typename\n  }\n  activeLeaderships(riClubId: "") {\n    role\n    clubName\n    clubId\n    __typename\n  }\n  nameWithPrefixSuffix\n  thisDistrictLeadership(district: $district, includeDLHistory: $includeDLHistory) {\n    roleId\n    role\n    startDate\n    endDate\n    id\n    riDistrictId\n    termYears\n    __typename\n  }\n  sharingPermissionsResult {\n    email\n    phone\n    __typename\n  }\n  associatedClubsInfo(district: $district) {\n    clubId\n    clubName\n    clubType\n    physicalLocation {\n      country\n      city\n      state\n      internationalProvince\n      __typename\n    }\n    __typename\n  }\n  preferredLanguage {\n    id\n    name\n    __typename\n  }\n  __typename\n}\n',
};
