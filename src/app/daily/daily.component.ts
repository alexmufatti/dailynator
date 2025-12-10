import {Component, computed, effect, inject, OnDestroy, signal, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatList, MatListItem} from "@angular/material/list";
import {StorageService} from '../storage.service';
import {Participant} from '../models/Participant';
import {CommunicationService} from '../communication.service';
import {Subscription} from 'rxjs';
import {Team} from '../models/Team';
import { DailySubtitleService, DailySubtitleResult } from '../services/daily-subtitle.service';
import type { DailySubtitleSourceType } from '../models/DailySubtitleSourceType';

@Component({
  selector: 'app-daily',
  imports: [
    CommonModule,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatList,
    MatListItem
  ],
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.css'
})
export class DailyComponent implements OnDestroy, OnInit {
  private readonly storage = inject(StorageService);
  protected next = signal<Participant | undefined>(undefined)
  protected selectedText = computed(() => {
    return this.next() ? `Next up: ${this.next()?.name}` : ''
  });
  private readonly communication = inject(CommunicationService);

  protected people: Participant[] = [];
  protected available: Participant[] = [];
  protected remaining: Participant[] = [];
  protected done: Participant[] = [];
  protected teams = signal<Team[]>([]);
  protected activeTeamId = signal<string>('');
  protected activeTeam = computed(() => this.teams().find((team) => team.id === this.activeTeamId()));
  private readonly communicationSubscription: Subscription;
  private readonly teamsEffect?: ReturnType<typeof effect>;
  dailyJoke?: string;
  dailyAuthor?: string;

  constructor(
    private dailySubtitleService: DailySubtitleService,
  ) {
    this.communicationSubscription = this.communication.currentMessage.subscribe((message) => {
      if (message === 'team-changed') {
        this.reset();
        void this.loadDailySubtitle();
      } else if (message === 'daily-subtitle-config-changed') {
        void this.loadDailySubtitle();
      } else {
        this.reset();
      }
    });
    this.teamsEffect = effect(() => {
      this.teams.set(this.storage.getTeams()());
      this.activeTeamId.set(this.storage.getActiveTeamId()());
      this.people = this.storage.getPeople();
      this.available = this.people.filter(p => p.present);
      this.remaining = this.available.slice(0);
      this.done = [];
      this.next.set(undefined);
    });
  }

  ngOnInit(): void {
    this.loadDailySubtitle();
  }

  private getActiveTeamSubtitleSource(): DailySubtitleSourceType | undefined {
    const team = this.storage.getActiveTeam();
    return team?.subtitleSource;
  }

  private async loadDailySubtitle(): Promise<void> {
    try {
      const source = this.getActiveTeamSubtitleSource();
      const result: DailySubtitleResult | undefined = await this.dailySubtitleService.getDailySubtitle(source);
      this.dailyJoke = result?.text;
      this.dailyAuthor = result?.author;
    } catch {
      this.dailyJoke = undefined;
      this.dailyAuthor = undefined;
    }
  }

  ngOnDestroy(): void {
    this.communicationSubscription.unsubscribe();
    this.teamsEffect?.destroy();
  }

  protected selectNext() {
    if (this.remaining.length > 0) {

      if (this.next()) {
        const currentIdx = this.remaining.findIndex(r => r.name === this.next()?.name)
        const d = this.remaining.splice(currentIdx, 1);
        this.done.push(d[0]);
      }
      const index = Math.floor(Math.random() * this.remaining.length);

      this.next.set(this.remaining[index]);
    }
  }

  private log() {
    console.log('remaining', this.remaining)
    console.log('people', this.people)
    console.log('next', this.next()?.name)
    console.log('done', this.done)
  }

  protected reset() {
    console.log('reset')
    this.people = this.storage.getPeople();
    this.available = this.people.filter(p => p.present);
    this.remaining = this.available.slice(0);
    this.done = [];
    this.next.set(undefined);
  }

  protected skip() {
    if (this.next()) {
      const index = Math.floor(Math.random() * this.remaining.length);

      this.next.set(this.remaining[index]);
    }
  }
}
