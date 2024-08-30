import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { CoursesService } from './courses.service';
import { COURSES } from '../__fixtures__/courses.fixture';
import { environment } from '../../environments/environment';
import { CourseCategory } from '../models/course-category.model';

describe('Courses service', () => {
  let httpTestingController: HttpTestingController;
  let coursesService: CoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    coursesService = TestBed.inject(CoursesService);
  });

  describe('#loadAllCourses', () => {
    it('should retrive all courses', async () => {
      const coursesresponse = coursesService.loadAllCourses();

      const req = httpTestingController.expectOne(
        `${environment.apiRoot}/courses`
      );
      expect(req.request.method).toEqual('GET');
      req.flush({ courses: COURSES });

      expect(await coursesresponse).toBe(COURSES);
    });

    it('should be OK returning no courses', async () => {
      const coursesresponse = coursesService.loadAllCourses();

      const req = httpTestingController.expectOne(
        `${environment.apiRoot}/courses`
      );
      expect(req.request.method).toEqual('GET');
      req.flush({ courses: [] });

      expect(await coursesresponse).toEqual([]);
    });

    it('should return 404 error', async () => {
      const msg = '404 not found';
      const coursesresponsePromise = coursesService.loadAllCourses();

      const req = httpTestingController.expectOne(
        `${environment.apiRoot}/courses`
      );
      expect(req.request.method).toEqual('GET');
      req.flush({ status: 404, statusText: msg });

      try {
        await coursesresponsePromise;
      } catch (error: any) {
        expect(error.message).toContain(msg);
      }
    });

    it('should return expected courses (called multiple times)', async () => {
      coursesService.loadAllCourses();
      const coursesresponse = coursesService.loadAllCourses();

      const requests = httpTestingController.match(
        `${environment.apiRoot}/courses`
      );
      expect(requests.length)
        .withContext('calls to loadAllCourses()')
        .toEqual(2);
      requests[0].flush({ courses: [] });
      requests[1].flush({ courses: COURSES });

      expect(await coursesresponse).toBe(COURSES);
    });
  });

  it('schould retrieve course by id', async () => {
    const courseId = Object.keys(COURSES)[0];
    const courseresponse = coursesService.getCourseById(courseId);

    const req = httpTestingController.expectOne(
      `${environment.apiRoot}/courses/${courseId}`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COURSES[courseId]);

    expect(await courseresponse).toBe(COURSES[courseId]);
  });

  it('should create a course', async () => {
    const courseToCreate = {
      title: 'Modern Angular With Signals',
      longDescription:
        'Learn signals in depth. Build a modern signal-based application with async/await, standalone components and optional RxJs.',
      iconUrl:
        'https://d3vigmphadbn9b.cloudfront.net/course-images/large-images/angular-signals-course.jpg',
      courseListIcon:
        'https://angular-academy.s3.amazonaws.com/main-logo/main-page-logo-small-hat.png',
      category: 'BEGINNER' as CourseCategory,
      lessonsCount: 10,
      seqNo: 0,
      url: 'angular-signals-course',
      price: 50,
      uploadedImageUrl: '',
    };
    const createdCourse = {
      id: '1',
      ...courseToCreate,
    };

    const createdCourseResponse = coursesService.createCourse(courseToCreate);

    const req = httpTestingController.expectOne(
      `${environment.apiRoot}/courses`
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(courseToCreate);
    req.flush(createdCourse);

    expect(await createdCourseResponse).toEqual(createdCourse);
  });

  it('should save a course', async () => {
    const courseId = Object.keys(COURSES)[0];
    const updates = {
      title: 'Updated title',
    };

    const updatedCourseResponse = coursesService.saveCourse(courseId, updates);

    const req = httpTestingController.expectOne(
      `${environment.apiRoot}/courses/${courseId}`
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(updates);
    req.flush({
      ...COURSES[courseId],
      ...updates,
    });

    expect(await updatedCourseResponse).toEqual({
      ...COURSES[courseId],
      ...updates,
    });
  });

  it('should return 404 error', async () => {
    const msg = 'Deliberate 404';
    const courseId = '9999999';
    const updates = {
      title: 'Updated title',
    };
    const responseError = coursesService.saveCourse(courseId, updates);

    const req = httpTestingController.expectOne(
      `${environment.apiRoot}/courses/${courseId}`
    );
    // respond with a 404 and the error message in the body
    req.flush(msg, { status: 404, statusText: msg });

    try {
      await responseError;
    } catch (error: any) {
      expect(error.message).toContain(msg);
    }
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
