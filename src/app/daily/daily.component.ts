import {Component, computed, effect, inject, OnDestroy, signal} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatList, MatListItem} from "@angular/material/list";
import {NgForOf} from "@angular/common";
import {StorageService} from '../storage.service';
import {Participant} from '../models/Participant';
import {CommunicationService} from '../communication.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-daily',
    imports: [
        MatButton,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatList,
        MatListItem,
        NgForOf
    ],
  templateUrl: './daily.component.html',
  styleUrl: './daily.component.css'
})
export class DailyComponent implements OnDestroy {
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
  private readonly communicationSubscription: Subscription;
  private readonly teamsEffect?: ReturnType<typeof effect>;

  constructor() {
    this.communicationSubscription = this.communication.currentMessage.subscribe(() => this.reset());
    this.teamsEffect = effect(() => {
      this.people = this.storage.getPeople();
      this.available = this.people.filter(p => p.present);
      this.remaining = this.available.slice(0);
      this.done = [];
      this.next.set(undefined);
    });
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
