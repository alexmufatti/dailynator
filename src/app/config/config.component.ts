import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem} from "@angular/material/list";
import {NgForOf} from "@angular/common";

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
        NgForOf
    ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit{
  protected newParticipant = signal('');
  protected people: string[] = [];

  ngOnInit(): void {
    this.people = localStorage.getItem('people') ? JSON.parse(localStorage.getItem('people')!) : [];
  }

  protected addParticipant() {
    if (this.newParticipant()) {
      this.people.push(this.newParticipant());
      localStorage.setItem('people', JSON.stringify(this.people));
      this.newParticipant.set('');
    }
  }

  protected removeParticipant(participant: string) {
    const index = this.people.indexOf(participant);
    this.people.splice(index, 1);
    localStorage.setItem('people', JSON.stringify(this.people));
  }
}
