import { CoursesService } from './../services/courses.service';
import {
  ChangeDetectionStrategy,
  EffectRef,
  OnInit,
  signal,
} from '@angular/core';
import { Component, computed, effect, inject, Injector } from '@angular/core';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';
import { catchError, from, interval, startWith, throwError } from 'rxjs';
import {
  toObservable,
  toSignal,
  outputToObservable,
  outputFromObservable,
} from '@angular/core/rxjs-interop';
import { CoursesServiceWithFetch } from '../services/courses-fetch.service';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { LoadingService } from '../loading/loading.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  #courses = signal<Course[]>([]);
  coursesService = inject(CoursesService);
  loadingService = inject(LoadingService);
  messagesService = inject(MessagesService);

  injector = inject(Injector);

  dialog = inject(MatDialog);

  beginnerCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(({ category }) => category === 'BEGINNER');
  });

  advancedCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(({ category }) => category === 'ADVANCED');
  });

  courses$ = from(this.coursesService.loadAllCourses());

  ngOnInit(): void {
    this.loadCourses();
  }

  // onToSignal() {
  //   const number$ = interval(1000).pipe(startWith(0));
  //   const numbers = toSignal(number$, {
  //     injector: this.injector,
  //     // initialValue: 0,
  //     requireSync: true,
  //   });

  //   effect(
  //     () => {
  //       console.log(numbers());
  //     },
  //     {
  //       injector: this.injector,
  //     }
  //   );
  // }

  // error handling
  onToSignal() {
    try {
      const courses$ = from(this.coursesService.loadAllCourses()).pipe(
        catchError((e) => {
          console.log(`catchError ${e}`);
          throw e;
        })
      );
      const courses = toSignal(courses$, {
        injector: this.injector,
        rejectErrors: true,
      });
      effect(
        () => {
          console.log(courses());
        },
        {
          injector: this.injector,
        }
      );
    } catch (error) {
      console.log('error catch', error);
    }
  }

  onToObservable() {
    // const numbers = signal(0);
    // const numbers$ = toObservable(numbers, {
    //   injector: this.injector,
    // });
    // numbers$.subscribe((val) => {
    //   console.log(val);
    // });
  }

  async loadCourses() {
    try {
      const courses = await this.coursesService.loadAllCourses();
      this.#courses.set(courses);
    } catch (e) {
      this.messagesService.showMessage('Error loading courses', 'error');
      console.log(e);
    }
  }

  onCourseUpdated(updateCoures: Course) {
    const courses = this.#courses();

    const newCourses = courses.map((course) => {
      return course.id === updateCoures.id ? updateCoures : course;
    });

    this.#courses.set(newCourses);
  }

  async onCourseDeleted(courseId: string) {
    try {
      await this.coursesService.deleteCourse(courseId);
      const courses = this.#courses();
      const newCourses = courses.filter((course) => course.id !== courseId);
      this.#courses.set(newCourses);
    } catch (err) {
      console.error(err);
      alert(`Error deleting course.`);
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(this.dialog, {
      mode: 'create',
      title: 'Create New Course',
    });
    if (!newCourse) {
      return;
    }
    const newCourses = [...this.#courses(), newCourse];
    this.#courses.set(newCourses);
  }
}
