import { Injectable } from '@angular/core';
import type { DailySubtitleSourceType } from '../models/DailySubtitleSourceType';

export type { DailySubtitleSourceType };

export interface DailySubtitleConfig {
  source: DailySubtitleSourceType;
}

@Injectable({ providedIn: 'root' })
export class DailySubtitleConfigService {
  private config: DailySubtitleConfig = {
    source: 'random',
  };

  getConfig(): DailySubtitleConfig {
    return this.config;
  }

  setConfig(cfg: Partial<DailySubtitleConfig>): void {
    this.config = { ...this.config, ...cfg };
  }
}
