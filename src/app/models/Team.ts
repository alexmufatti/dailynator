import { Participant } from './Participant';
import { DailySubtitleSourceType } from './DailySubtitleSourceType';
import { SprintCapacity } from './SprintCapacity';

export type Team = {
  id: string;
  name: string;
  participants: Participant[];
  subtitleSource?: DailySubtitleSourceType;
  sprintCapacity?: SprintCapacity;
};
