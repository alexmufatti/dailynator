import {Component, effect, inject, model, signal} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FormsModule} from '@angular/forms';
import {ConfigComponent} from './config/config.component';
import {StorageService} from './storage.service';
import {DailyComponent} from './daily/daily.component';
import {CapacityComponent} from './capacity/capacity.component';
import {Team} from './models/Team';
import packageJson from '../../package.json';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {CommunicationService} from './communication.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [MatTabGroup, MatTab, FormsModule, ConfigComponent, DailyComponent, CapacityComponent, MatFormField, MatLabel, MatSelect, MatOption, MatIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly storage = inject(StorageService);
  private readonly communication = inject(CommunicationService);
  title = 'Dailynator';
  version = packageJson.version;
  protected resetInvoker = model<number>(0);
  protected teams = signal<Team[]>([]);
  protected activeTeam = signal<Team | undefined>(undefined);
  protected activeTeamId = signal<string>('');

  constructor() {
    effect(() => {
      const teams = this.storage.getTeams()();
      this.teams.set(teams);
      const active = this.storage.getActiveTeam();
      this.activeTeam.set(active);
      this.activeTeamId.set(this.storage.getActiveTeamId()());
    });
  }

  protected selectTeam(event: MatSelectChange) {
    this.storage.setActiveTeam(event.value);
    this.communication.changeMessage('team-changed');
  }

  protected reset() {
    console.log('resetting')
    this.resetInvoker.update((n) => n+1)
  }
}
