import { Injectable } from '@angular/core';
import {Participant} from './models/Participant';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  peopleKey = 'people';
  constructor() { }

  public getPeople(): Participant[] {
    const peopleString = localStorage.getItem(this.peopleKey);
    if (peopleString) {
      return JSON.parse(peopleString);
    } else {
      return [];
    }
  }

  public setPeople(people: Participant[]) {
    localStorage.setItem(this.peopleKey, JSON.stringify(people));
  }

  setProject(project: string) {
    localStorage.setItem('project', project);
  }

  getProject(): string {
    return localStorage.getItem('project') ?? '';
  }
}
