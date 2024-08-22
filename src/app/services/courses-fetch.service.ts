import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CoursesServiceWithFetch {
  env = environment.apiRoot;

  async loadAllCourses(): Promise<Course[]> {
    const response = await fetch(`${this.env}/courses`);
    const payload = await response.json();

    return payload.courses;
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    const response = await fetch(`${this.env}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    return response.json();
  }

  async saveCourse(
    courseId: string,
    changes: Partial<Course>
  ): Promise<Course> {
    const response = await fetch(`${this.env}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    });
    return response.json();
  }

  async deleteCourse(courseId: string): Promise<void> {
    await fetch(`${this.env}/courses/${courseId}`, {
      method: 'DELETE',
    });
  }
}
