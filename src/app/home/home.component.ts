import { ChangeDetectionStrategy, EffectRef, signal } from '@angular/core';
import { Component, computed, effect, inject, Injector } from '@angular/core';
import { CoursesService } from '../services/courses.service';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';
import { catchError, from, throwError } from 'rxjs';
import {
  toObservable,
  toSignal,
  outputToObservable,
  outputFromObservable,
} from '@angular/core/rxjs-interop';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  counter = signal<number>(0);

  tenXCounter = computed(() => {
    const val = this.counter();
    return val * 10;
  });

  effectRef: EffectRef | null = null;

  constructor() {
    this.effectRef = effect((onCleanup) => {
      const counter = this.counter();
      const timeout = setTimeout(() => {
        console.log('Effect', counter);
      }, 1000);
      onCleanup(() => clearInterval(timeout));
    });
  }

  append() {
    this.counter.update((c) => c + 1);
  }

  cleanup() {
    this.effectRef?.destroy();
  }
}
