import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { CoursesCardListComponent } from './courses-card-list.component';
import { provideRouter } from '@angular/router';
import { COURSES } from '../__fixtures__/courses.fixture';
import { By } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Course } from '../models/course.model';
import { of } from 'rxjs';
import { CourseCategory } from '../models/course-category.model';
import { subscribeSpyTo } from '@hirez_io/observer-spy';

describe('CoursesCardListComponent', () => {
  let component: CoursesCardListComponent;
  let fixture: ComponentFixture<CoursesCardListComponent>;
  let dialogMock = {
    open: jasmine.createSpy(),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CoursesCardListComponent],
      providers: [
        provideRouter([]),
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesCardListComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('courses', []);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('input: courses', () => {
    it('schould render list of courses', () => {
      const courses = Object.values(COURSES);
      fixture.componentRef.setInput('courses', courses);

      fixture.detectChanges();

      const result = fixture.debugElement.queryAll(
        By.css("[data-testid='course-card']")
      );

      expect(result.length).toEqual(courses.length);
    });

    it('schould render empty message, when no courses are provided', () => {
      fixture.componentRef.setInput('courses', []);

      fixture.detectChanges();

      const noMessage = fixture.debugElement.query(
        By.css("[data-testid='no-courses']")
      );

      noMessage.nativeElement.textContent;

      expect(noMessage.nativeElement.textContent).toBe('No courses yet');
    });

    it('schould not render empty message, when courses are provided', () => {
      const courses = Object.values(COURSES);
      fixture.componentRef.setInput('courses', courses);

      fixture.detectChanges();

      const noMessage = fixture.debugElement.query(
        By.css("[data-testid='no-courses']")
      );

      expect(noMessage).toBeFalsy();
    });
  });

  describe('output: courseUpdated', () => {
    it('should emit updated course after edit', fakeAsync(() => {
      let courseUpdate: Course | undefined;
      const testData = {
        id: '18',
        title: 'Test title',
        longDescription:
          'Learn signals in depth. Build a modern signal-based application with async/await, standalone components and optional RxJs.',
        iconUrl:
          'https://d3vigmphadbn9b.cloudfront.net/course-images/large-images/angular-signals-course.jpg',
        courseListIcon:
          'https://angular-academy.s3.amazonaws.com/main-logo/main-page-logo-small-hat.png',
        uploadedImageUrl: '',
        category: 'BEGINNER' as CourseCategory,
        lessonsCount: 10,
        seqNo: 0,
        url: 'angular-signals-course',
        price: 50,
      };
      dialogMock.open.and.returnValue({
        afterClosed: () => of(testData),
      });
      fixture.componentRef.setInput('courses', [testData]);
      component.courseUpdated.subscribe((course) => (courseUpdate = course));

      fixture.detectChanges();

      const editButton = fixture.debugElement.query(
        By.css('[data-testid="edit-course"]')
      );

      editButton.nativeElement.click();
      tick();

      expect(dialogMock.open)
        .withContext('open edit dialog')
        .toHaveBeenCalled();

      expect(courseUpdate).toBe(testData);
    }));
  });

  describe('output: courseDeleted', () => {
    it('should emit course id to be deleted', async () => {
      let courseIdDel: string | undefined;
      const testData = {
        id: '18',
        title: 'Test title',
        longDescription:
          'Learn signals in depth. Build a modern signal-based application with async/await, standalone components and optional RxJs.',
        iconUrl:
          'https://d3vigmphadbn9b.cloudfront.net/course-images/large-images/angular-signals-course.jpg',
        courseListIcon:
          'https://angular-academy.s3.amazonaws.com/main-logo/main-page-logo-small-hat.png',
        uploadedImageUrl: '',
        category: 'BEGINNER' as CourseCategory,
        lessonsCount: 10,
        seqNo: 0,
        url: 'angular-signals-course',
        price: 50,
      };
      fixture.componentRef.setInput('courses', [testData]);
      component.courseDeleted.subscribe((courseId) => (courseIdDel = courseId));

      fixture.detectChanges();

      const deleteButton = fixture.debugElement.query(
        By.css('[data-testid="delete-course"]')
      );

      deleteButton.nativeElement.click();

      expect(courseIdDel).toBe(testData.id);
    });
  });
});
