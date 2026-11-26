// Test data for local work and the staging database. Pure data, no DB access,
// so the unit test can check it without Postgres.
// Emails use the reserved .test domain so no real person is ever emailed.

export const THEMES = ['Heritage', 'Ecology', 'Livelihoods', 'Education', 'Health', 'Culture'];

const PLACES = [
  ['Rajasthan', 'Jaipur'], ['Kerala', 'Kochi'], ['Assam', 'Guwahati'], ['Gujarat', 'Ahmedabad'],
  ['Odisha', 'Bhubaneswar'], ['Punjab', 'Amritsar'], ['Tamil Nadu', 'Madurai'], ['Meghalaya', 'Shillong'],
  ['Madhya Pradesh', 'Bhopal'], ['Karnataka', 'Mysuru'], ['West Bengal', 'Kolkata'], ['Uttarakhand', 'Dehradun'],
  ['Himachal Pradesh', 'Shimla'], ['Bihar', 'Patna'], ['Goa', 'Panaji'], ['Telangana', 'Hyderabad'],
];

export const GROUP_COUNT = 16;
const COMMITTEE_COUNT = 4;
const FELLOW_COUNT = 4;

const pad = (n) => String(n).padStart(2, '0');

export function buildSeed(year = 2027) {
  const groups = PLACES.slice(0, GROUP_COUNT).map(([state, city], i) => ({
    code: `G${pad(i + 1)}`,
    title: `${THEMES[i % THEMES.length]} in ${city}`,
    year,
    theme: THEMES[i % THEMES.length],
    primary_state: state,
    city,
  }));

  const users = [
    { email: 'head@dip.example.test', name: 'Head of DIP', role: 'head', group: null },
    { email: 'warden@dip.example.test', name: 'Campus Warden', role: 'warden', group: null },
  ];
  for (let i = 1; i <= COMMITTEE_COUNT; i++) {
    users.push({ email: `committee${i}@dip.example.test`, name: `Committee Member ${i}`, role: 'committee', group: null });
  }
  for (let i = 1; i <= FELLOW_COUNT; i++) {
    users.push({ email: `fellow${i}@dip.example.test`, name: `DIP Fellow ${i}`, role: 'fellow', group: null });
  }
  for (const g of groups) {
    users.push({ email: `rep.${g.code.toLowerCase()}@dip.example.test`, name: `Rep ${g.code}`, role: 'rep', group: g.code });
  }

  // Each committee member and each Fellow gets a block of 4 groups.
  const perPerson = GROUP_COUNT / COMMITTEE_COUNT;
  const assignments = [];
  groups.forEach((g, i) => {
    const n = Math.floor(i / perPerson) + 1;
    assignments.push({ group: g.code, email: `committee${n}@dip.example.test`, kind: 'committee' });
    assignments.push({ group: g.code, email: `fellow${n}@dip.example.test`, kind: 'fellow' });
  });

  // Two sample itineraries so later stories (review queue, manifest) have data to show.
  const itineraries = [
    {
      group: 'G01', version: 1, status: 'Approved', auto_check_status: 'Passed', approver: 'committee1@dip.example.test',
      legs: [
        { from: ['Maharashtra', 'Pune', 'Pune Jn'], to: ['Rajasthan', 'Jaipur', 'Jaipur Jn'], mode: 'train', train_no: '12991',
          depart_at: `${year}-01-12T21:35:00+05:30`, arrive_at: `${year}-01-13T17:10:00+05:30` },
        { from: ['Rajasthan', 'Jaipur', 'Jaipur Jn'], to: ['Maharashtra', 'Pune', 'Pune Jn'], mode: 'train', train_no: '12992',
          depart_at: `${year}-01-24T14:50:00+05:30`, arrive_at: `${year}-01-25T10:30:00+05:30` },
      ],
    },
    {
      group: 'G02', version: 1, status: 'Pending review', auto_check_status: 'Running', approver: null,
      legs: [
        { from: ['Maharashtra', 'Pune', 'Pune Jn'], to: ['Kerala', 'Kochi', 'Ernakulam Jn'], mode: 'train', train_no: '16381',
          depart_at: `${year}-01-14T08:10:00+05:30`, arrive_at: `${year}-01-15T13:05:00+05:30` },
      ],
    },
  ];

  return { themes: THEMES, groups, users, assignments, itineraries };
}
