import { Participant } from './Participant';
import { DailySubtitleSourceType } from './DailySubtitleSourceType';

export type Team = {
  id: string;
  name: string;
  participants: Participant[];
  subtitleSource?: DailySubtitleSourceType;
};
