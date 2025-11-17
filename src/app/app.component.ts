import {Component, effect, inject, model, signal} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FormsModule} from '@angular/forms';
import {ConfigComponent} from './config/config.component';
import {StorageService} from './storage.service';
import {DailyComponent} from './daily/daily.component';
import {Team} from './models/Team';
import packageJson from '../../package.json';

@Component({
  selector: 'app-root',
  imports: [MatTabGroup, MatTab, FormsModule, ConfigComponent, DailyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly storage = inject(StorageService);
  title = 'Dailynator';
  version = packageJson.version;
  protected resetInvoker = model<number>(0);
  protected teams = signal<Team[]>([]);
  protected activeTeam = signal<Team | undefined>(undefined);

  constructor() {
    effect(() => {
      const teams = this.storage.getTeams()();
      this.teams.set(teams);
      const active = this.storage.getActiveTeam();
      this.activeTeam.set(active);
    });
  }

  protected reset() {
    console.log('resetting')
    this.resetInvoker.update((n) => n+1)
  }
}
