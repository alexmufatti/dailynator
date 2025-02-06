import {Component, computed, OnInit, signal} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {ConfigComponent} from './config/config.component';

@Component({
  selector: 'app-root',
  imports: [MatTabGroup, MatTab, MatButton, FormsModule, ConfigComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected next = signal('')
  protected selectedText = computed(() => {
    return this.next() ? `Next up: ${this.next()}` : ''
  });


  protected people: string[] = [];
  protected remaining: string[] = [];
  title = 'dailynator';

  ngOnInit(): void {
    this.people = localStorage.getItem('people') ? JSON.parse(localStorage.getItem('people')!) : [];
    this.remaining = this.people.slice(0);
  }

  protected selectNext() {
    if (this.remaining.length > 0) {

      if (this.next() !== '') {
        const currentIdx = this.remaining.indexOf(this.next())
        this.remaining.splice(currentIdx, 1);
      }
        const index = Math.floor(Math.random() * this.remaining.length);

        this.next.set(this.remaining[index]);
        console.log('remaining', this.remaining)
        console.log('people', this.people)
        console.log('next', this.next())

    }
  }

  protected reset() {
    this.ngOnInit()
    this.next.set('');
  }

  protected skip() {
    this.remaining.push(this.next())
    this.selectNext();
  }


}
