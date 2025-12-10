import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { StorageService } from '../storage.service';
import { CommunicationService } from '../communication.service';
import { SprintCapacity } from '../models/SprintCapacity';
import { Participant } from '../models/Participant';

@Component({
  selector: 'app-capacity',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormField,
    MatLabel,
    MatInput,
    MatDivider,
    MatSnackBarModule,
    MatIcon
  ],
  templateUrl: './capacity.component.html',
  styleUrl: './capacity.component.css'
})
export class CapacityComponent {
  private readonly storage = inject(StorageService);
  private readonly communication = inject(CommunicationService);
  private readonly snackBar = inject(MatSnackBar);

  protected activeTeamId = signal<string>('');
  protected selectedTeam = computed(() => this.storage.getTeam(this.activeTeamId()));
  protected people: Participant[] = [];

  // Sprint Capacity
  protected workingDays = signal<number>(10);
  protected averageVelocity = signal<number>(0);
  protected vacationDaysMap = signal<Map<string, number>>(new Map());
  protected estimatedVelocity = computed(() => this.calculateEstimatedVelocity());

  constructor() {
    effect(() => {
      this.activeTeamId.set(this.storage.getActiveTeamId()());
      const activeTeam = this.storage.getActiveTeam();
      this.people = activeTeam?.participants ?? [];
      this.loadSprintCapacity();
    });
  }

  private loadSprintCapacity() {
    const activeTeam = this.storage.getActiveTeam();
    if (activeTeam?.sprintCapacity) {
      const capacity = activeTeam.sprintCapacity;
      this.workingDays.set(capacity.workingDays);
      this.averageVelocity.set(capacity.averageVelocity);

      const map = new Map<string, number>();
      capacity.vacationDays.forEach(vd => {
        map.set(vd.participantName, vd.vacationDays);
      });
      this.vacationDaysMap.set(map);
    } else {
      // Reset to defaults
      this.workingDays.set(10);
      this.averageVelocity.set(0);
      this.vacationDaysMap.set(new Map());
    }
  }

  private calculateEstimatedVelocity(): number {
    const totalWorkingDays = this.workingDays();
    const peopleCount = this.people.length;

    if (peopleCount === 0 || totalWorkingDays === 0 || this.averageVelocity() === 0) {
      return 0;
    }

    // Calculate total vacation days
    let totalVacationDays = 0;
    this.people.forEach(p => {
      totalVacationDays += this.vacationDaysMap().get(p.name) || 0;
    });

    // Calculate available person-days
    const totalPersonDays = peopleCount * totalWorkingDays;
    const availablePersonDays = totalPersonDays - totalVacationDays;

    // Calculate estimated velocity
    const velocityPerPersonDay = this.averageVelocity() / (peopleCount * totalWorkingDays);
    return Math.round(velocityPerPersonDay * availablePersonDays * 10) / 10;
  }

  protected updateVacationDays(participantName: string, days: number) {
    const map = new Map(this.vacationDaysMap());
    map.set(participantName, days);
    this.vacationDaysMap.set(map);
  }

  protected getVacationDays(participantName: string): number {
    return this.vacationDaysMap().get(participantName) || 0;
  }

  protected saveSprintCapacity() {
    const vacationDays = this.people.map(p => ({
      participantName: p.name,
      vacationDays: this.vacationDaysMap().get(p.name) || 0
    }));

    const capacity: SprintCapacity = {
      workingDays: this.workingDays(),
      vacationDays: vacationDays,
      averageVelocity: this.averageVelocity()
    };

    this.storage.setTeamSprintCapacity(this.activeTeamId(), capacity);
    this.communication.changeMessage('sprint-capacity-changed');
    this.snackBar.open('Sprint capacity saved', 'OK', { duration: 3000 });
  }
}

