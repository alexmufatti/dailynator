import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {ConfigComponent} from './config/config.component';
import {StorageService} from './storage.service';
import {Participant} from './models/Participant';
import {MatList, MatListItem} from '@angular/material/list';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [MatTabGroup, MatTab, MatButton, FormsModule, ConfigComponent, MatList, MatListItem, NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly storage = inject(StorageService);
  protected next = signal<Participant|undefined>(undefined)
  protected selectedText = computed(() => {
    return this.next() ? `Next up: ${this.next()?.name}` : ''
  });

  protected people: Participant[] = [];
  protected available: Participant[] = [];
  protected remaining: Participant[] = [];
  protected done: Participant[] = [];
  protected project = '';
  title = 'Dailynator';

  ngOnInit(): void {
    this.project = this.storage.getProject();
    this.people = this.storage.getPeople()
    this.available = this.storage.getPeople().filter(p=> p.present);
    this.remaining = this.available.slice(0);
    this.done = [];
    this.log();
  }

  protected selectNext() {
    if (this.remaining.length > 0) {

      if (this.next()) {
        const currentIdx = this.remaining.findIndex(r=> r.name === this.next()?.name)
        const d = this.remaining.splice(currentIdx, 1);
        this.done.push(d[0]);
      }
        const index = Math.floor(Math.random() * this.remaining.length);

        this.next.set(this.remaining[index]);
      this.log();

    }
  }

  private log() {
    console.log('remaining', this.remaining)
    console.log('people', this.people)
    console.log('next', this.next()?.name)
    console.log('done', this.done)
  }

  protected reset() {
    console.log("Reset")

    this.ngOnInit()
    this.next.set(undefined);
  }

  protected skip() {
    if (this.next()) {
      this.remaining.push(this.next()!)
      this.selectNext();
    }
  }


}
