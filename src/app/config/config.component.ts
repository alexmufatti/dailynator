import {Component, inject, model, OnInit, output, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem} from "@angular/material/list";
import {NgClass, NgForOf} from "@angular/common";
import {Participant} from '../models/Participant';
import {StorageService} from '../storage.service';
import {MatCard, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {CommunicationService} from '../communication.service';

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
    MatCardTitle,
    MatCardHeader
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit{
  private readonly storage = inject(StorageService);
  private readonly communication = inject(CommunicationService);

  protected newParticipant = signal('');
  protected project = model('');
  protected people: Participant[] = [];

  ngOnInit(): void {
    this.people = this.storage.getPeople();
    this.project.subscribe(() => {
      this.save();
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
    this.storage.setProject(this.project());
    this.communication.changeMessage('aa')
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
}
