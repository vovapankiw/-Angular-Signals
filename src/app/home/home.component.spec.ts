import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { CoursesService } from '../services/courses.service';
import { LoadingService } from '../loading/loading.service';
import { MessagesService } from '../messages/messages.service';
import { MatDialog } from '@angular/material/dialog';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MockCoursesCardListComponent } from '../courses-card-list/course-card-list.component.spec';
import { COURSES } from '../__fixtures__/courses.fixture';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { By } from '@angular/platform-browser';
import { Course } from '../models/course.model';
import { click } from '../helpers/click';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let courseService: CoursesService;

  let coursesServiceSpy = jasmine.createSpyObj('CoursesService', [
    'loadAllCourses',
    'deleteCourse',
  ]);
  coursesServiceSpy.loadAllCourses.and.returnValue(
    Promise.resolve(Object.values([]))
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent, BrowserAnimationsModule, MatTab, MatTabGroup],
      providers: [
        {
          provide: CoursesService,
          useValue: coursesServiceSpy,
        },
        {
          provide: LoadingService,
          useValue: jasmine.createSpyObj('LoadingService', [
            'loadingOn',
            'loadingOff',
          ]),
        },
        {
          provide: MessagesService,
          useValue: jasmine.createSpyObj('MessagesService', ['showMessage']),
        },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open']),
        },
      ],
    })
      .overrideComponent(HomeComponent, {
        remove: {
          imports: [CoursesCardListComponent],
        },
        add: {
          imports: [MockCoursesCardListComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    courseService = TestBed.inject(CoursesService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass Beginner courses by default', fakeAsync(() => {
    const beginnerCourses = Object.values(COURSES).filter(
      (c: any) => c.category === 'BEGINNER'
    );
    coursesServiceSpy.loadAllCourses.and.returnValue(
      Promise.resolve(Object.values(COURSES))
    );

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const courseListCardInput = fixture.debugElement.query(
      By.css('courses-card-list')
    ).componentInstance.courses;

    expect(beginnerCourses).toEqual(courseListCardInput());
  }));

  it('should pass Advanced courses', fakeAsync(() => {
    const advancedCourses = Object.values(COURSES).filter(
      (c: any) => c.category === 'ADVANCED'
    );
    coursesServiceSpy.loadAllCourses.and.returnValue(
      Promise.resolve(Object.values(COURSES))
    );

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const [_, advancedTab] = fixture.debugElement.queryAll(By.css('.mdc-tab'));

    click(advancedTab);
    fixture.detectChanges();
    flush();

    const courseListCardInput = fixture.debugElement.query(
      By.css('courses-card-list')
    ).componentInstance.courses;

    expect(advancedCourses).toEqual(courseListCardInput());
  }));
});
