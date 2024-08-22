import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Course } from '../models/course.model';
import { inject } from '@angular/core';
import { CoursesService } from '../services/courses.service';

export const courseResolver: ResolveFn<Course | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const courseId = route.paramMap.get('courseId');

  if (!courseId) {
    return null;
  }

  const courseService = inject(CoursesService);
  return courseService.getCourseById(courseId);
};
