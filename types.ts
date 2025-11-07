
export interface Personnel {
  id: number;
  name: string;
  phone: string | null;
  teamId: number | null;
  discipline: string;
  helmetColor: 'white' | 'blue';
}

export interface TeamInfo {
  id: number;
  name: string;
  tasks?: string;
  assignedTo?: string | null;
}

export interface Team extends TeamInfo {
  members: Personnel[];
}