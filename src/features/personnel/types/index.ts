export interface Personnel {
    id: number;
    name: string;
    phone: string | null;
    teamId: number | null;
    discipline: string;
    helmetColor: 'white' | 'blue' | 'bass' | 'riggansvarling';
}
