// Shared configuration options for subtitle sources.
import type { DailySubtitleSourceType } from './DailySubtitleSourceType';

export const SUBTITLE_SOURCE_OPTIONS: { value: DailySubtitleSourceType; label: string }[] = [
  { value: 'joke', label: 'Battuta' },
  { value: 'motivational', label: 'Motivazionale' },
  { value: 'random', label: 'Casuale' },
  { value: 'disabled', label: 'Nessuna' },
];

