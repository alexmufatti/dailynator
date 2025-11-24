import {Component, computed, effect, inject, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem} from "@angular/material/list";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Participant} from '../models/Participant';
import {StorageService} from '../storage.service';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {CommunicationService} from '../communication.service';

import {Team} from '../models/Team';
import {MatDivider} from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import type { DailySubtitleSourceType } from '../models/DailySubtitleSourceType';

@Component({
  selector: 'app-config',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatLine,
    MatList,
    MatListItem,
    NgForOf,
    NgClass,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardHeader,
    NgIf,
    MatDivider,
    MatSelectModule,
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent {
  private readonly storage = inject(StorageService);
  private readonly communication = inject(CommunicationService);

  protected newParticipant = signal('');
  protected people: Participant[] = [];
  protected teams = signal<Team[]>([]);
  protected activeTeamId = signal<string>('');
  protected newTeamName = signal('');
  protected renamingTeamId = signal<string | null>(null);
  protected renameValue = signal('');
  protected selectedTeam = computed(() => this.storage.getTeam(this.activeTeamId()));

  protected readonly subtitleSourceOptions: { value: DailySubtitleSourceType; label: string }[] = [
    { value: 'joke', label: 'Barzellette' },
    { value: 'motivational', label: 'Frasi motivazionali' },
    { value: 'random', label: 'Casuale' },
    { value: 'disabled', label: 'Nessuna frase' },
  ];

  constructor() {
    effect(() => {
      this.teams.set(this.storage.getTeams()());
      this.activeTeamId.set(this.storage.getActiveTeamId()());
      const activeTeam = this.storage.getActiveTeam();
      this.people = activeTeam?.participants ?? [];
      if (this.renamingTeamId() && this.renamingTeamId() === activeTeam?.id) {
        this.renameValue.set(activeTeam?.name ?? '');
      }
    });
  }

  protected addParticipant() {
    if (this.newParticipant()) {
      this.people.push({ name: this.newParticipant(), present: true });
      this.save();
      this.newParticipant.set('');
    }
  }

  private save() {
    this.storage.setPeople(this.people);
    this.communication.changeMessage('aa')
  }

  protected startRename(team: Team) {
    if (team) {
      this.renamingTeamId.set(team.id);
      this.renameValue.set(team.name);
    }
   }

  protected confirmRename() {
    if (this.renamingTeamId()) {
      this.storage.renameTeam(this.renamingTeamId()!, this.renameValue());
      this.renamingTeamId.set(null);
      this.communication.changeMessage('team-renamed');
     }
   }

  protected cancelRename() {
    this.renamingTeamId.set(null);
    this.renameValue.set('');
   }

  protected createTeam() {
    this.storage.addTeam(this.newTeamName());
    this.newTeamName.set('');
    this.communication.changeMessage('team-changed');
  }

  protected deleteTeam(teamId: string) {
    this.storage.deleteTeam(teamId);
    this.communication.changeMessage('team-changed');
    if (this.renamingTeamId() === teamId) {
      this.cancelRename();
    }
   }

  protected togglePresence(participantIndex: number) {
    this.people[participantIndex].present = !this.people[participantIndex].present;
    this.save();
  }

  protected removeParticipant(participant: string) {
    const index = this.people.findIndex(p=> p.name === participant);
    this.people.splice(index, 1);
    this.save();
  }

  protected onFieldKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addParticipant();
    }
  }

  protected changeSubtitleSource(team: Team, source: DailySubtitleSourceType) {
    this.storage.setTeamSubtitleSource(team.id, source);
    if (team.id === this.activeTeamId()) {
      this.communication.changeMessage('daily-subtitle-config-changed');
    }
  }
}
