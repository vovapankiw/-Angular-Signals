import { Component, effect, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Course } from '../models/course.model';
import { EditCourseDialogData } from './edit-course-dialog.data.model';
import { CoursesService } from '../services/courses.service';
import { LoadingIndicatorComponent } from '../loading/loading.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CourseCategoryComboboxComponent } from '../course-category-combobox/course-category-combobox.component';
import { CourseCategory } from '../models/course-category.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'edit-course-dialog',
  standalone: true,
  imports: [
    LoadingIndicatorComponent,
    ReactiveFormsModule,
    CourseCategoryComboboxComponent,
  ],
  templateUrl: './edit-course-dialog.component.html',
  styleUrl: './edit-course-dialog.component.scss',
})
export class EditCourseDialogComponent {
  dialogref = inject(MatDialogRef);

  coursesService = inject(CoursesService);

  data: EditCourseDialogData = inject(MAT_DIALOG_DATA);

  fb = inject(FormBuilder);

  form = this.fb.group({
    title: [''],
    longDescription: [''],
    courseCategory: [''],
    iconUrl: [''],
  });

  category = signal<CourseCategory>('BEGINNER');

  constructor() {
    this.form.patchValue({
      title: this.data?.course?.title,
      longDescription: this.data?.course?.longDescription,
      iconUrl: this.data?.course?.iconUrl,
    });
    this.category.set(this.data?.course?.category ?? 'BEGINNER');
  }

  onClose() {
    this.dialogref.close();
  }

  async onSave() {
    const courseProps = this.form.value as Partial<Course>;
    courseProps.category = this.category();

    if (this.data?.mode === 'update') {
      await this.saveCourse(this.data?.course!.id, courseProps);
    } else if (this.data?.mode === 'create') {
      await this.createCourse(courseProps);
    }
  }

  async saveCourse(courseId: string, changes: Partial<Course>) {
    try {
      const updatedCourse = await this.coursesService.saveCourse(
        courseId,
        changes
      );
      this.dialogref.close(updatedCourse);
    } catch (e) {
      console.log(e);
    }
  }

  async createCourse(course: Partial<Course>) {
    try {
      const updatedCourse = await this.coursesService.createCourse(course);
      this.dialogref.close(updatedCourse);
    } catch (e) {
      console.log(e);
    }
  }
}

export async function openEditCourseDialog(
  dialog: MatDialog,
  data: EditCourseDialogData
) {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const closed$ = dialog.open(EditCourseDialogComponent, config).afterClosed();

  return firstValueFrom(closed$);
}
