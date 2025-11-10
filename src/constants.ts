import { Personnel } from './types';

export const MOCK_PERSONNEL: Personnel[] = [
  { id: 1, name: 'John "Weld" Smith', phone: '555-0101', teamId: 1, discipline: 'Rigger', helmetColor: 'white' },
  { id: 2, name: 'Mike "Sparks" Johnson', phone: '555-0102', teamId: 1, discipline: 'Rigger', helmetColor: 'white' },
  { id: 3, name: 'Dave "Hammer" Davis', phone: '555-0103', teamId: 2, discipline: 'Rigger', helmetColor: 'green' },
  { id: 4, name: 'Chris "Gears" Wilson', phone: '555-0104', teamId: 2, discipline: 'Rigger', helmetColor: 'white' },
  { id: 5, name: 'Alex "Bolt" Brown', phone: '555-0105', teamId: 2, discipline: 'Scaffolder', helmetColor: 'white' },
  { id: 6, name: 'Steve "Iron" Miller', phone: '555-0106', teamId: 3, discipline: 'Pipefitter', helmetColor: 'blue' },
  { id: 7, name: 'Brian "Crane" Moore', phone: '555-0107', teamId: 3, discipline: 'Rigger', helmetColor: 'white' },
  { id: 8, name: 'Kevin "Lift" Taylor', phone: '555-0108', teamId: 3, discipline: 'Flagman', helmetColor: 'white' },
  { id: 9, name: 'Tom "Hoist" Anderson', phone: '555-0109', teamId: 3, discipline: 'Rigger', helmetColor: 'green' },
  { id: 10, name: 'Paul "Rope" White', phone: '555-0110', teamId: null, discipline: 'Rigger', helmetColor: 'white' },
  { id: 11, name: 'Mark "Cable" Harris', phone: '555-0111', teamId: null, discipline: 'Scaffolder', helmetColor: 'white' },
  { id: 12, name: 'James "Hook" Clark', phone: '555-0112', teamId: 4, discipline: 'Rigger', helmetColor: 'blue' },
  { id: 13, name: 'Peter "Beam" Lewis', phone: '555-0113', teamId: 4, discipline: 'Flagman', helmetColor: 'white' },
  { id: 14, name: 'George "Steel" Hall', phone: '555-0114', teamId: null, discipline: 'Pipefitter', helmetColor: 'white' },
  { id: 15, name: 'Ryan "Grip" Allen', phone: '555-0115', teamId: null, discipline: 'Rigger', helmetColor: 'white' },
  { id: 16, name: 'Anna "Spider" Lee', phone: '555-0116', teamId: null, discipline: 'Rope Access', helmetColor: 'white' },
  { id: 17, name: 'Gary "Wheel" Scott', phone: '555-0117', teamId: null, discipline: 'Driver', helmetColor: 'white' },
  { id: 18, name: 'Frank "Plank" Wright', phone: '555-0118', teamId: 4, discipline: 'Scaffolder', helmetColor: 'blue' },
];

// Helper to get dates
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
const threeDaysAgo = new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0];
const fiveDaysAgo = new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0];

export const MOCK_TEAM_INFO = [
    {id: 1, name: 'Alpha Crew', location: 'PAU1', workOrder: '1234', status: 'In progress', date: today, notes: ''},
    {id: 2, name: 'Bravo Crew', location: 'PAU2', workOrder: '1235', status: 'Done', date: yesterday, notes: ''},
    {id: 3, name: 'Charlie Crew', location: 'PAU3', workOrder: '1236', status: 'Not started', date: threeDaysAgo, notes: ''},
    {id: 4, name: 'Delta Crew', location: 'PAU4', workOrder: '1237', status: 'On hold', date: fiveDaysAgo, notes: ''},
];