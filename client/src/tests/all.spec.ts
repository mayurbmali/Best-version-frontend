// ═══════════════════════════════════════════════════════════════════════
// all.spec.ts — Single file containing all 61 tests (36 existing + 25 new)
// ═══════════════════════════════════════════════════════════════════════

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { JobListComponent } from '../app/component/job-list/job-list.component';
import { JobCreateComponent } from '../app/component/job-create/job-create.component';
import { MyJobComponent } from '../app/component/my-job/my-job.component';
import { MyProposalComponent } from '../app/component/my-proposal/my-proposal.component';
import { ProfileComponent } from '../app/component/profile/profile.component';

import { JobService } from '../app/services/job.service';
import { ProposalService } from '../app/services/proposal.service';
import { AuthService } from '../app/services/auth.service';

import { Job } from '../app/model/job';
import { Proposal } from '../app/model/proposal';
import { User } from '../app/model/user';

import { environment } from '../environments/environment';


// ═══════════════════════════════════════════════════════════════════════
// 1. JobListComponent  (8 existing + 4 new = 12 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('JobListComponent', () => {
  let component: JobListComponent;
  let fixture: ComponentFixture<JobListComponent>;
  let mockJobService: jasmine.SpyObj<JobService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockJobs: Job[] = [
    { id: 1, title: 'Frontend Developer', status: 'OPEN' } as Job,
    { id: 2, title: 'Backend Developer', status: 'OPEN' } as Job
  ];

  beforeEach(async () => {
    mockJobService = jasmine.createSpyObj('JobService', ['getJobList', 'applyToJob']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getRole']);

    await TestBed.configureTestingModule({
      declarations: [JobListComponent],
      providers: [
        { provide: JobService, useValue: mockJobService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobListComponent);
    component = fixture.componentInstance;

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') return JSON.stringify(1);
      return null;
    });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch jobs and set role on init', () => {
    mockJobService.getJobList.and.returnValue(of(mockJobs));
    mockAuthService.getRole.and.returnValue('USER');
    component.ngOnInit();
    expect(mockAuthService.getRole).toHaveBeenCalled();
    expect(mockJobService.getJobList).toHaveBeenCalled();
    expect(component.roleName).toBe('USER');
    expect(component.job).toEqual(mockJobs);
    expect(component.allJobs).toEqual(mockJobs);
  });

  it('should handle error when fetching jobs fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockJobService.getJobList.and.returnValue(throwError(() => new Error('Fetch error')));
    component.ngOnInit();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching jobs', jasmine.any(Error));
  });

  it('should apply to a job and update status', () => {
    mockJobService.applyToJob.and.returnValue(of({ message: 'Applied successfully' }));
    component.job = [...mockJobs];
    spyOn(window, 'alert');
    component.applyJob(1);
    expect(mockJobService.applyToJob).toHaveBeenCalledWith(1, 1);
    expect(window.alert).toHaveBeenCalledWith('Applied successfully');
    expect(component.job.find(j => j.id === 1)?.status).toBe('APPLIED');
  });

  it('should handle 409 error when applying to a job', () => {
    mockJobService.applyToJob.and.returnValue(throwError(() => ({ status: 409 })));
    spyOn(window, 'alert');
    component.applyJob(1);
    expect(window.alert).toHaveBeenCalledWith('You have already applied to this job.');
  });

  it('should handle other errors when applying to a job', () => {
    const consoleSpy = spyOn(console, 'error');
    mockJobService.applyToJob.and.returnValue(throwError(() => ({ status: 500 })));
    spyOn(window, 'alert');
    component.applyJob(1);
    expect(window.alert).toHaveBeenCalledWith('Failed to apply. Please try again.');
    expect(consoleSpy).toHaveBeenCalledWith('Error details:', jasmine.any(Object));
  });

  it('should filter jobs by title in searchJobs()', () => {
    component.allJobs = mockJobs;
    component.searchTitle = 'frontend';
    component.searchJobs();
    expect(component.job.length).toBe(1);
    expect(component.job[0].title).toContain('Frontend');
  });

  it('should reset job list if searchTitle is empty', () => {
    component.allJobs = mockJobs;
    component.searchTitle = '   ';
    component.searchJobs();
    expect(component.job).toEqual(mockJobs);
  });

  // NEW
  it('[NEW] should initialize with empty job list before ngOnInit', () => {
    expect(component.job).toEqual([]);
    expect(component.allJobs).toEqual([]);
  });

  it('[NEW] should return empty array when search term matches no jobs', () => {
    component.allJobs = mockJobs;
    component.searchTitle = 'python';
    component.searchJobs();
    expect(component.job.length).toBe(0);
  });

  it('[NEW] should set roleName to CLIENT when AuthService returns CLIENT', () => {
    mockJobService.getJobList.and.returnValue(of(mockJobs));
    mockAuthService.getRole.and.returnValue('CLIENT');
    component.ngOnInit();
    expect(component.roleName).toBe('CLIENT');
  });

  it('[NEW] should only update the applied job status, not others', () => {
    mockJobService.applyToJob.and.returnValue(of({ message: 'Applied successfully' }));
    component.job = [...mockJobs];
    spyOn(window, 'alert');
    component.applyJob(1);
    expect(component.job.find(j => j.id === 1)?.status).toBe('APPLIED');
    expect(component.job.find(j => j.id === 2)?.status).toBe('OPEN');
  });
  it('[NEW] should have searchTitle as empty string initially', () => {
  expect(component.searchTitle).toBe('');
});
});


// ═══════════════════════════════════════════════════════════════════════
// 2. JobCreateComponent  (5 existing + 4 new = 9 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('JobCreateComponent', () => {
  let component: JobCreateComponent;
  let fixture: ComponentFixture<JobCreateComponent>;
  let mockJobService: jasmine.SpyObj<JobService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockJobService = jasmine.createSpyObj('JobService', ['create']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [JobCreateComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: JobService, useValue: mockJobService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required controls', () => {
    expect(component.jobForm).toBeDefined();
    expect(component.jobForm.contains('title')).toBeTrue();
    expect(component.jobForm.contains('description')).toBeTrue();
    expect(component.jobForm.contains('budget')).toBeTrue();
    expect(component.jobForm.contains('status')).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    spyOn(window, 'alert');
    component.onSubmit();
    expect(mockJobService.create).not.toHaveBeenCalled();
  });

  it('should submit valid form and navigate on success', () => {
    spyOn(window, 'alert');
    component.jobForm.setValue({ title: 'Test Job', description: 'Job description', budget: 1000, status: 'OPEN' });
    mockJobService.create.and.returnValue(of({}));
    component.onSubmit();
    expect(mockJobService.create).toHaveBeenCalledWith(component.clientId, component.jobForm.value);
    expect(window.alert).toHaveBeenCalledWith('Job created successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/job-list']);
  });

  it('should handle error on job creation failure', () => {
    spyOn(window, 'alert');
    const consoleSpy = spyOn(console, 'error');
    component.jobForm.setValue({ title: 'Test Job', description: 'Job description', budget: 1000, status: 'OPEN' });
    mockJobService.create.and.returnValue(throwError(() => new Error('Creation failed')));
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('Failed to create job.');
    expect(consoleSpy).toHaveBeenCalledWith('Error creating job:', jasmine.any(Error));
  });

  // NEW
  it('[NEW] form should be invalid when no controls are filled', () => {
    // Verify the form is invalid before submission (all controls empty by default)
    expect(component.jobForm.valid).toBeFalse();
    expect(component.jobForm.get('title')?.invalid).toBeTrue();
    expect(component.jobForm.get('description')?.invalid).toBeTrue();
    expect(component.jobForm.get('budget')?.invalid).toBeTrue();
  });

  it('[NEW] title control should be invalid when empty', () => {
    component.jobForm.get('title')?.setValue('');
    expect(component.jobForm.get('title')?.valid).toBeFalse();
    expect(component.jobForm.get('title')?.errors?.['required']).toBeTrue();
  });

  it('[NEW] description control should be invalid when empty', () => {
    component.jobForm.get('description')?.setValue('');
    expect(component.jobForm.get('description')?.valid).toBeFalse();
    expect(component.jobForm.get('description')?.errors?.['required']).toBeTrue();
  });

  it('[NEW] form should be invalid when budget is not provided', () => {
    component.jobForm.setValue({ title: 'Test Job', description: 'Some description', budget: null, status: 'OPEN' });
    expect(component.jobForm.valid).toBeFalse();
  });
  it('[NEW] status control should be invalid when empty', () => {
  component.jobForm.get('status')?.setValue('');
  expect(component.jobForm.get('status')?.valid).toBeFalse();
  expect(component.jobForm.get('status')?.errors?.['required']).toBeTrue();
});
});


// ═══════════════════════════════════════════════════════════════════════
// 3. MyJobComponent  (5 existing + 4 new = 9 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('MyJobComponent', () => {
  let component: MyJobComponent;
  let fixture: ComponentFixture<MyJobComponent>;
  let mockJobService: jasmine.SpyObj<JobService>;

  const mockUserId = 1;
  const mockJobs: Job[] = [
    { id: 1, title: 'Job 1', status: 'APPLIED' } as Job,
    { id: 2, title: 'Job 2', status: 'ACCEPTED' } as Job,
    { id: 3, title: 'Job 3', status: 'REJECTED' } as Job
  ];

  beforeEach(async () => {
    mockJobService = jasmine.createSpyObj('JobService', ['getMyJobs', 'updateJobStatus']);

    await TestBed.configureTestingModule({
      declarations: [MyJobComponent],
      providers: [{ provide: JobService, useValue: mockJobService }]
    }).compileComponents();

    fixture = TestBed.createComponent(MyJobComponent);
    component = fixture.componentInstance;

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') return JSON.stringify(mockUserId);
      return null;
    });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and filter jobs on init', () => {
    mockJobService.getMyJobs.and.returnValue(of(mockJobs));
    component.ngOnInit();
    expect(mockJobService.getMyJobs).toHaveBeenCalledWith(mockUserId);
    expect(component.jobs.length).toBe(2);
    expect(component.jobs.every(j => j.status === 'APPLIED' || j.status === 'ACCEPTED')).toBeTrue();
  });

  it('should handle error when fetching jobs fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockJobService.getMyJobs.and.returnValue(throwError(() => new Error('Fetch error')));
    component.ngOnInit();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching jobs', jasmine.any(Error));
  });

  it('should update job status', () => {
    component.jobs = [{ id: 1, title: 'Job 1', status: 'APPLIED' } as Job];
    mockJobService.updateJobStatus.and.returnValue(of({}));
    component.updateStatus(1, 'COMPLETED');
    expect(mockJobService.updateJobStatus).toHaveBeenCalledWith(1, 'COMPLETED');
    expect(component.jobs[0].status).toBe('COMPLETED');
  });

  it('should handle error when updating job status fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockJobService.updateJobStatus.and.returnValue(throwError(() => new Error('Update error')));
    component.jobs = [{ id: 1, title: 'Job 1', status: 'APPLIED' } as Job];
    component.updateStatus(1, 'COMPLETED');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to update status:', 'Update error');
    expect(consoleSpy).toHaveBeenCalledWith('Full error:', jasmine.any(Error));
  });

  // NEW
  it('[NEW] should initialize with empty jobs array', () => {
    expect(component.jobs).toEqual([]);
  });

  it('[NEW] should exclude REJECTED jobs from the displayed list', () => {
    mockJobService.getMyJobs.and.returnValue(of(mockJobs));
    component.ngOnInit();
    expect(component.jobs.some(j => j.status === 'REJECTED')).toBeFalse();
  });

  it('[NEW] should only update status of the correct job by id', () => {
    component.jobs = [
      { id: 1, title: 'Job 1', status: 'APPLIED' } as Job,
      { id: 2, title: 'Job 2', status: 'ACCEPTED' } as Job
    ];
    mockJobService.updateJobStatus.and.returnValue(of({}));
    component.updateStatus(1, 'COMPLETED');
    expect(component.jobs[0].status).toBe('COMPLETED');
    expect(component.jobs[1].status).toBe('ACCEPTED');
  });

  it('[NEW] should call getMyJobs with correct userId from localStorage', () => {
    mockJobService.getMyJobs.and.returnValue(of([]));
    component.ngOnInit();
    expect(mockJobService.getMyJobs).toHaveBeenCalledWith(1);
  });
  it('[NEW] should not update any job when jobId does not match', () => {
  component.jobs = [
    { id: 1, title: 'Job 1', status: 'APPLIED' } as Job,
    { id: 2, title: 'Job 2', status: 'ACCEPTED' } as Job
  ];
  mockJobService.updateJobStatus.and.returnValue(of({}));
  component.updateStatus(99, 'COMPLETED');
  expect(component.jobs[0].status).toBe('APPLIED');
  expect(component.jobs[1].status).toBe('ACCEPTED');
});
});


// ═══════════════════════════════════════════════════════════════════════
// 4. MyProposalComponent  (3 existing + 4 new = 7 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('MyProposalComponent', () => {
  let component: MyProposalComponent;
  let fixture: ComponentFixture<MyProposalComponent>;
  let mockProposalService: jasmine.SpyObj<ProposalService>;

  const mockProposals: Proposal[] = [
    { id: 1, title: 'Proposal 1' },
    { id: 2, title: 'Proposal 2' }
  ] as any;

  beforeEach(async () => {
    mockProposalService = jasmine.createSpyObj('ProposalService', ['getMyProposals']);

    await TestBed.configureTestingModule({
      declarations: [MyProposalComponent],
      providers: [{ provide: ProposalService, useValue: mockProposalService }]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProposalComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch proposals on init', () => {
    mockProposalService.getMyProposals.and.returnValue(of(mockProposals));
    component.ngOnInit();
    expect(mockProposalService.getMyProposals).toHaveBeenCalled();
    expect(component.proposals).toEqual(mockProposals);
  });

  it('should handle error when fetching proposals fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockProposalService.getMyProposals.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(mockProposalService.getMyProposals).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching proposals', jasmine.any(Error));
  });

  // NEW
  it('[NEW] should initialize with empty proposals array', () => {
    expect(component.proposals).toEqual([]);
  });

  it('[NEW] should set proposals to correct count when data returned', () => {
    mockProposalService.getMyProposals.and.returnValue(of(mockProposals));
    component.ngOnInit();
    expect(component.proposals.length).toBe(2);
  });

  it('[NEW] should leave proposals empty when error occurs', () => {
    mockProposalService.getMyProposals.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.proposals).toEqual([]);
  });

  it('[NEW] should call getMyProposals exactly once on ngOnInit', () => {
    mockProposalService.getMyProposals.and.returnValue(of([]));
    component.ngOnInit();
    expect(mockProposalService.getMyProposals).toHaveBeenCalledTimes(1);
  });
  it('[NEW] proposals array should remain empty before ngOnInit is called', () => {
  expect(component.proposals).toEqual([]);
  expect(component.proposals.length).toBe(0);
});
});


// ═══════════════════════════════════════════════════════════════════════
// 5. ProfileComponent  (4 existing + 4 new = 8 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUserId = 1;
  const mockProfile: User = { id: mockUserId, name: 'John Doe', role: 'USER' } as any;
  const mockUsers: User[] = [
    { id: 1, name: 'User One', role: 'USER' },
    { id: 2, name: 'Admin User', role: 'ADMIN' },
    { id: 3, name: 'User Two', role: 'USER' }
  ] as any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getLoggedInUser', 'getUsers', 'getRole']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') return JSON.stringify(mockUserId);
      return null;
    });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch profile and users on init', () => {
    mockAuthService.getLoggedInUser.and.returnValue(of(mockProfile));
    mockAuthService.getUsers.and.returnValue(of(mockUsers));
    mockAuthService.getRole.and.returnValue('USER');
    component.ngOnInit();
    expect(mockAuthService.getLoggedInUser).toHaveBeenCalledWith(mockUserId);
    expect(component.profile).toEqual(mockProfile);
    expect(component.roleName).toBe('USER');
    expect(component.users.length).toBe(2);
    expect(component.users.every(u => u.role !== 'ADMIN')).toBeTrue();
  });

  it('should handle error when getLoggedInUser fails', () => {
    mockAuthService.getLoggedInUser.and.returnValue(throwError(() => new Error('Error')));
    mockAuthService.getUsers.and.returnValue(of(mockUsers));
    mockAuthService.getRole.and.returnValue('USER');
    component.ngOnInit();
    expect(component.errorMessage).toBe('Failed to load profile');
  });

  it('should filter out ADMIN users in getUser()', () => {
    mockAuthService.getUsers.and.returnValue(of(mockUsers));
    component.getUser();
    expect(mockAuthService.getUsers).toHaveBeenCalled();
    expect(component.users.length).toBe(2);
    expect(component.users.some(u => u.role === 'ADMIN')).toBeFalse();
  });

  // NEW
  it('[NEW] ADMIN role should be set correctly on component', () => {
    mockAuthService.getLoggedInUser.and.returnValue(of(mockProfile));
    mockAuthService.getUsers.and.returnValue(of(mockUsers));
    mockAuthService.getRole.and.returnValue('ADMIN');
    component.ngOnInit();
    expect(component.roleName).toBe('ADMIN');
  });

  it('[NEW] should set users to empty when getUsers returns empty array', () => {
    // Component does not catch getUsers errors — test with empty response instead
    mockAuthService.getLoggedInUser.and.returnValue(of(mockProfile));
    mockAuthService.getUsers.and.returnValue(of([]));
    mockAuthService.getRole.and.returnValue('USER');
    component.ngOnInit();
    expect(component.users).toEqual([]);
  });

  it('[NEW] should set profile correctly after successful load', () => {
    mockAuthService.getLoggedInUser.and.returnValue(of(mockProfile));
    mockAuthService.getUsers.and.returnValue(of(mockUsers));
    mockAuthService.getRole.and.returnValue('USER');
    component.ngOnInit();
    expect(component.profile).toBeTruthy();
    expect(component.profile?.id).toBe(mockUserId);
  });

  it('[NEW] should have zero users when getUsers returns empty array', () => {
    mockAuthService.getLoggedInUser.and.returnValue(of(mockProfile));
    mockAuthService.getUsers.and.returnValue(of([]));
    mockAuthService.getRole.and.returnValue('USER');
    component.ngOnInit();
    expect(component.users.length).toBe(0);
  });
  it('[NEW] should initialize errorMessage as empty string', () => {
  expect(component.errorMessage).toBe('');
});
});


// ═══════════════════════════════════════════════════════════════════════
// 6. JobService  (8 existing + 5 new = 13 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  const mockToken = 'mock-token';
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getToken']);
    mockAuthService.getToken.and.returnValue(mockToken);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobService, { provide: AuthService, useValue: mockAuthService }]
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a job', () => {
    const clientId = 1;
    const jobData = { title: 'New Job' };
    service.create(clientId, jobData).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/client/${clientId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jobData);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });

  it('should get a job by ID', () => {
    const jobId = 123;
    const mockJob = { id: jobId, title: 'Test Job' };
    service.get(jobId).subscribe((job) => { expect(job).toEqual(mockJob); });
    const req = httpMock.expectOne(`${apiUrl}/${jobId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJob);
  });

  it('should get job list', () => {
    const mockJobs: Job[] = [{ id: 1, title: 'Job 1' } as Job, { id: 2, title: 'Job 2' } as Job];
    service.getJobList().subscribe((jobs) => {
      expect(jobs.length).toBe(2);
      expect(jobs).toEqual(mockJobs);
    });
    const req = httpMock.expectOne(`${apiUrl}/api/jobs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJobs);
  });

  it('should apply to a job', () => {
    service.applyToJob(10, 5).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/10/apply`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 5 });
    req.flush({});
  });

  it('should get my jobs', () => {
    const mockJobs: Job[] = [{ id: 1, title: 'My Job' } as Job];
    service.getMyJobs(5).subscribe((jobs) => { expect(jobs).toEqual(mockJobs); });
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/my-jobs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJobs);
  });

  it('should update job status', () => {
    service.updateJobStatus(101, 'completed').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/status/101?status=completed`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush({});
  });

  it('should get user report', () => {
    const mockReport = { totalUsers: 100 };
    service.getUserReport().subscribe((report) => { expect(report).toEqual(mockReport); });
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/report/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReport);
  });

  // NEW
  it('[NEW] getJobList should send Authorization header', () => {
    service.getJobList().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush([]);
  });

  it('[NEW] getMyJobs should send Authorization header', () => {
    service.getMyJobs(5).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/my-jobs`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush([]);
  });

  it('[NEW] applyToJob should send Authorization header', () => {
    service.applyToJob(10, 5).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/10/apply`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });

  it('[NEW] updateJobStatus should send Authorization header', () => {
    service.updateJobStatus(101, 'CLOSED').subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/status/101?status=CLOSED`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });

  it('[NEW] getUserReport should send Authorization header', () => {
    service.getUserReport().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/jobs/report/users`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });
});


// ═══════════════════════════════════════════════════════════════════════
// 7. ProposalService  (3 existing + 4 new = 7 tests)
// ═══════════════════════════════════════════════════════════════════════
describe('ProposalService', () => {
  let service: ProposalService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  const mockToken = 'mock-token';
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getToken']);
    mockAuthService.getToken.and.returnValue(mockToken);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProposalService, { provide: AuthService, useValue: mockAuthService }]
    });

    service = TestBed.inject(ProposalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to create proposal', () => {
    const freelancerId = 1;
    const proposalData = { title: 'Test Proposal' };
    service.create(freelancerId, proposalData).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/proposals/freelancer/${freelancerId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.body).toEqual(proposalData);
    req.flush({});
  });

  it('should send GET request to fetch proposals', () => {
    const mockProposals: Proposal[] = [{ id: 1, title: 'Proposal 1' }, { id: 2, title: 'Proposal 2' }] as any;
    service.getMyProposals().subscribe((proposals) => {
      expect(proposals.length).toBe(2);
      expect(proposals).toEqual(mockProposals);
    });
    const req = httpMock.expectOne(`${apiUrl}/api/proposals/myPropsal`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush(mockProposals);
  });

  // NEW
  it('[NEW] getMyProposals should use correct endpoint URL', () => {
    service.getMyProposals().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/proposals/myPropsal`);
    expect(req.request.url).toBe(`${apiUrl}/api/proposals/myPropsal`);
    req.flush([]);
  });

  it('[NEW] create should use correct URL with freelancerId', () => {
    service.create(42, {}).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/proposals/freelancer/42`);
    expect(req.request.url).toContain('/freelancer/42');
    req.flush({});
  });

  it('[NEW] getMyProposals should return empty array when API returns empty', () => {
    service.getMyProposals().subscribe((proposals) => {
      expect(proposals).toEqual([]);
      expect(proposals.length).toBe(0);
    });
    const req = httpMock.expectOne(`${apiUrl}/api/proposals/myPropsal`);
    req.flush([]);
  });

  it('[NEW] create should send Content-Type application/json', () => {
    service.create(1, { title: 'Proposal' }).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/api/proposals/freelancer/1`);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({});
  });
  it('[NEW] getMyProposals should send Authorization header with Bearer token', () => {
  service.getMyProposals().subscribe();
  const req = httpMock.expectOne(`${apiUrl}/api/proposals/myPropsal`);
  expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  req.flush([]);
});
});