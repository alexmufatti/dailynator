import { Participant } from './Participant';

export type Team = {
  id: string;
  name: string;
  project: string;
  participants: Participant[];
};

