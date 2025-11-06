
export interface Personnel {
  id: number;
  name: string;
  phone: string;
  teamId: number | null;
  discipline: string;
  helmetColor: 'white' | 'green' | 'blue';
}

export interface TeamInfo {
  id: number;
  name: string;
}

export interface Team extends TeamInfo {
  members: Personnel[];
}