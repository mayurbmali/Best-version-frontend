import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../../model/user';
import { FreelancerProfile } from '../../model/freelancer-profile';
import { AuthService } from '../../services/auth.service';
import { FreelancerProfileService } from '../../services/freelancer-profile.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [FormBuilder]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: User | null = null;
  freelancerProfile: FreelancerProfile | null = null;
  users: User[] = [];
  roleName: string | null = '';
  errorMessage = '';
  loading = false;

  isEditing = false;
  updateSuccess = false;
  updateError = '';
  profileForm!: FormGroup;

  isProfEditing = false;
  profUpdateSuccess = false;
  profUpdateError = '';
  profForm!: FormGroup;

  completionPercentage = 0;
  showChecklist = false;
  completionFields: Array<{ label: string; icon: string; filled: boolean }> = [];

  // Admin delete
  confirmDeleteUser: User | null = null;
  deleteLoading = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  private formSub?: Subscription;
  private profFormSub?: Subscription;

  constructor(
    public authService: AuthService,
    private freelancerProfileService: FreelancerProfileService,
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole();
    this.fetchProfile();
    this.getUser();
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
    this.profFormSub?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  fetchProfile(): void {
    const userId = Number(localStorage.getItem('userId') || '1');
    this.authService.getLoggedInUser(userId).subscribe({
      next: (user) => {
        this.profile = user;
        this.initForm(user);
        if (this.roleName === 'FREELANCER') this.fetchFreelancerProfile(userId);
      },
      error: () => { this.errorMessage = 'Failed to load profile'; }
    });
  }

  fetchFreelancerProfile(userId: number): void {
    this.freelancerProfileService.getProfile(userId).subscribe({
      next: (fp) => { this.freelancerProfile = fp; this.initProfForm(fp); },
      error: () => { this.freelancerProfile = null; this.initProfForm(null); }
    });
  }

  loadProfile(): void { this.fetchProfile(); }

  getUser(): void {
    this.authService.getUsers().subscribe({
      next: (users) => { this.users = users.filter(u => u.role !== 'ADMIN'); },
      error: () => { this.errorMessage = 'Failed to load users list.'; }
    });
  }

  // ── Admin delete flow ────────────────────────────────────────────────────────
  openDeleteConfirm(user: User): void { this.confirmDeleteUser = user; }
  closeDeleteConfirm(): void { this.confirmDeleteUser = null; }

  confirmDelete(): void {
    if (!this.confirmDeleteUser) return;
    this.deleteLoading = true;
    const adminId = this.authService.getUserId();
    const targetId = this.confirmDeleteUser.id as number;
    const targetName = this.confirmDeleteUser.username;

    this.adminService.deleteUser(targetId, adminId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.confirmDeleteUser = null;
        this.users = this.users.filter(u => u.id !== targetId);
        this.showToast(`User "${targetName}" deleted successfully.`, 'success');
      },
      error: (err) => {
        this.deleteLoading = false;
        this.confirmDeleteUser = null;
        this.showToast(err?.error?.message || 'Failed to delete user.', 'error');
      }
    });
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4500);
  }

  dismissToast(): void { this.toastVisible = false; }

  // ── Main profile form ────────────────────────────────────────────────────
  initForm(user: User): void {
    const role = this.roleName;
    this.profileForm = this.fb.group({
      email: [user.email || '', [Validators.required, Validators.email]],
      contactNumber: [user.contactNumber || '', [Validators.pattern('^[0-9]{10}$')]],
      ...(role === 'CLIENT' || role === 'FREELANCER' ? { bio: [user.bio || '', [Validators.maxLength(500)]] } : {}),
      ...(role === 'FREELANCER' ? { skills: [user.skills || '', [Validators.maxLength(300)]] } : {})
    });
    this.formSub?.unsubscribe();
    if (role === 'FREELANCER') {
      this.formSub = this.profileForm.valueChanges.subscribe(() => this.computeCompletion());
      this.computeCompletion();
    }
  }

  enableEdit(): void { this.isEditing = true; this.updateSuccess = false; this.updateError = ''; if (this.profile) this.initForm(this.profile); }
  cancelEdit(): void { this.isEditing = false; this.updateSuccess = false; this.updateError = ''; if (this.roleName === 'FREELANCER') this.computeCompletion(); }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    const userId = this.authService.getUserId();
    const fv = this.profileForm.value;
    const payload: any = { email: fv.email, contactNumber: fv.contactNumber ? Number(fv.contactNumber) : null };
    if (this.roleName === 'CLIENT' || this.roleName === 'FREELANCER') payload.bio = fv.bio || '';
    if (this.roleName === 'FREELANCER') payload.skills = fv.skills || '';

    this.authService.updateProfile(userId, payload).subscribe({
      next: (updatedUser) => {
        this.profile = { ...this.profile!, ...updatedUser };
        this.isEditing = false;
        this.updateSuccess = true;
        this.updateError = '';
        this.showToast('Profile updated successfully!', 'success');
        if (this.roleName === 'FREELANCER') this.computeCompletion();
      },
      error: () => {
        this.updateError = 'Failed to update profile. Please try again.';
        this.showToast('Failed to update profile. Please try again.', 'error');
      }
    });
  }

  // ── Professional profile form ────────────────────────────────────────────
  initProfForm(fp: FreelancerProfile | null): void {
    this.profForm = this.fb.group({
      experienceYears: [fp?.experienceYears ?? null, [Validators.min(0), Validators.max(60)]],
      highestEducation: [fp?.highestEducation ?? '', [Validators.maxLength(200)]],
      linkedinUrl: [fp?.linkedinUrl ?? '', [Validators.maxLength(300)]],
      githubUrl: [fp?.githubUrl ?? '', [Validators.maxLength(300)]]
    });
    this.profFormSub?.unsubscribe();
    this.profFormSub = this.profForm.valueChanges.subscribe(() => this.computeCompletion());
    this.computeCompletion();
  }

  enableProfEdit(): void { this.isProfEditing = true; this.profUpdateSuccess = false; this.profUpdateError = ''; this.initProfForm(this.freelancerProfile); }
  cancelProfEdit(): void { this.isProfEditing = false; this.profUpdateSuccess = false; this.profUpdateError = ''; this.computeCompletion(); }

  saveProfProfile(): void {
    if (this.profForm.invalid) { this.profForm.markAllAsTouched(); return; }
    const userId = this.authService.getUserId();
    const fv = this.profForm.value;
    const payload: FreelancerProfile = {
      experienceYears: fv.experienceYears !== null && fv.experienceYears !== '' ? Number(fv.experienceYears) : null,
      highestEducation: fv.highestEducation || null,
      linkedinUrl: fv.linkedinUrl || null,
      githubUrl: fv.githubUrl || null
    };
    this.freelancerProfileService.saveProfile(userId, payload).subscribe({
      next: (saved) => {
        this.freelancerProfile = saved;
        this.isProfEditing = false;
        this.profUpdateSuccess = true;
        this.profUpdateError = '';
        this.showToast('Professional profile saved successfully!', 'success');
        this.computeCompletion();
      },
      error: () => {
        this.profUpdateError = 'Failed to save professional profile.';
        this.showToast('Failed to save professional profile.', 'error');
      }
    });
  }

  // ── Completion ────────────────────────────────────────────────────────────
  computeCompletion(): void {
    const email = this.isEditing ? (this.profileForm?.get('email')?.value || '').trim() : (this.profile?.email || '').trim();
    const contact = this.isEditing ? (this.profileForm?.get('contactNumber')?.value || '').toString().trim() : (this.profile?.contactNumber?.toString() || '').trim();
    const bio = this.isEditing ? (this.profileForm?.get('bio')?.value || '').trim() : (this.profile?.bio || '').trim();
    const skills = this.isEditing ? (this.profileForm?.get('skills')?.value || '').trim() : (this.profile?.skills || '').trim();
    const expYearsRaw = this.isProfEditing ? this.profForm?.get('experienceYears')?.value : this.freelancerProfile?.experienceYears;
    const expYears = expYearsRaw !== null && expYearsRaw !== undefined && expYearsRaw !== '';
    const education = this.isProfEditing ? (this.profForm?.get('highestEducation')?.value || '').trim() : (this.freelancerProfile?.highestEducation || '').trim();
    const linkedin = this.isProfEditing ? (this.profForm?.get('linkedinUrl')?.value || '').trim() : (this.freelancerProfile?.linkedinUrl || '').trim();
    const github = this.isProfEditing ? (this.profForm?.get('githubUrl')?.value || '').trim() : (this.freelancerProfile?.githubUrl || '').trim();

    this.completionFields = [
      { label: 'Email', icon: '✉️', filled: !!email },
      { label: 'Contact Number', icon: '📱', filled: !!contact },
      { label: 'Bio', icon: '📄', filled: !!bio },
      { label: 'Skills', icon: '🛠️', filled: !!skills },
      { label: 'Experience', icon: '🏅', filled: expYears },
      { label: 'Education', icon: '🎓', filled: !!education },
      { label: 'LinkedIn', icon: '🔗', filled: !!linkedin },
      { label: 'GitHub', icon: '💻', filled: !!github },
    ];
    const filled = this.completionFields.filter(f => f.filled).length;
    this.completionPercentage = Math.round((filled / this.completionFields.length) * 100);
  }

  get filledFieldsCount(): number { return this.completionFields.filter(f => f.filled).length; }

  getProgressColorClass(): string {
    if (this.completionPercentage === 100) return 'pf-prog-success';
    if (this.completionPercentage >= 75) return 'pf-prog-primary';
    if (this.completionPercentage >= 40) return 'pf-prog-warning';
    return 'pf-prog-danger';
  }

  getCompletionLabel(): string {
    if (this.completionPercentage === 100) return '🎉 Profile is 100% complete — you can apply to jobs!';
    if (this.completionPercentage >= 75) return 'Almost there — a few more fields to go.';
    if (this.completionPercentage >= 40) return 'Keep going — complete your profile to unlock job applications.';
    return '⚠️ Profile incomplete — complete all fields to apply for jobs.';
  }

  getInitials(name: string): string { return name ? name.charAt(0).toUpperCase() : 'U'; }
  getRoleClass(role: string): string { return role?.toLowerCase() || 'freelancer'; }

  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
