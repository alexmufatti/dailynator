import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DailySubtitleConfigService, DailySubtitleSourceType } from './daily-subtitleConfig.service';

export interface DailySubtitleResult {
  text?: string;
  author?: string;
}

@Injectable({ providedIn: 'root' })
export class DailySubtitleService {
  private http = inject(HttpClient);
  private cfgService = inject(DailySubtitleConfigService);

  async getDailySubtitle(sourceOverride?: DailySubtitleSourceType): Promise<DailySubtitleResult | undefined> {
    const cfg = this.cfgService.getConfig();
    const source = sourceOverride ?? cfg.source;
    if (source === 'disabled') {
      return undefined;
    }

    return this.fetchFromSource(source);
  }

  private async fetchFromSource(source: DailySubtitleSourceType): Promise<DailySubtitleResult | undefined> {
    switch (source) {
      case 'joke': {
        const text = await this.fetchJoke();
        return text ? { text } : undefined;
      }
      case 'motivational':
        return this.fetchMotivational();
      case 'random': {
        const choices: DailySubtitleSourceType[] = ['joke', 'motivational'];
        const picked = choices[Math.floor(Math.random() * choices.length)];
        return this.fetchFromSource(picked);
      }
      case 'disabled':
      default:
        return undefined;
    }
  }

  private async fetchJoke(): Promise<string | undefined> {
    // esempio: https://official-joke-api.appspot.com/jokes/random
    try {
      const res: any = await this.http
        .get('https://official-joke-api.appspot.com/jokes/random')
        .toPromise();
      if (res?.setup && res?.punchline) {
        return `${res.setup} ${res.punchline}`;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async fetchMotivational(): Promise<DailySubtitleResult | undefined> {
    // esempio: https://dummyjson.com/quotes/random
    try {
      const res: any = await this.http
        .get('https://dummyjson.com/quotes/random')
        .toPromise();
      const text = res?.quote as string | undefined;
      const author = res?.author as string | undefined;
      if (text) {
        return { text, author };
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}
