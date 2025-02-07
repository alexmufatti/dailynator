import {Component, computed, inject, model, OnInit, signal} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {ConfigComponent} from './config/config.component';
import {StorageService} from './storage.service';
import {Participant} from './models/Participant';
import {MatList, MatListItem} from '@angular/material/list';
import {NgForOf} from '@angular/common';
import {MatCard, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {DailyComponent} from './daily/daily.component';
import {CommunicationService} from './communication.service';

@Component({
  selector: 'app-root',
  imports: [MatTabGroup, MatTab, FormsModule, ConfigComponent, DailyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly storage = inject(StorageService);
  protected project = '';
  title = 'Dailynator';
  protected resetInvoker = model<number>(0);

  ngOnInit(): void {
    this.project = this.storage.getProject();
  }

  protected reset() {
    console.log('resetting')
    this.resetInvoker.update((n) => n+1)
  }
}
