import {
  Component, OnInit, OnDestroy, HostListener,
  AfterViewInit, ElementRef, ViewChild, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  opacity: number;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cursorSpotlight') spotlightRef!: ElementRef<HTMLElement>;
  @ViewChild('homePage') homeRef!: ElementRef<HTMLElement>;

  isScrolled = false;
  mobileMenuOpen = false;

  private observer!: IntersectionObserver;
  private animFrame!: number;
  private particles: Particle[] = [];
  private ctx!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;
  private readonly PARTICLE_COUNT = 65;
  private readonly MAX_DIST = 130;
  private readonly COLORS = ['rgba(6,182,212,', 'rgba(168,85,247,', 'rgba(94,210,156,'];

  stats = [
    { value: '12K+', label: 'Freelancers' },
    { value: '4.8K+', label: 'Projects Shipped' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '$2M+', label: 'Total Paid Out' }
  ];

  features = [
    { tag: 'Matching', icon: '⚡', cls: 'violet', title: 'Instant Matching',
      description: 'AI-powered project-to-freelancer matching in seconds.', size: 'large' },
    { tag: 'Security', icon: '🔐', cls: 'cyan', title: 'Secure Payments',
      description: 'Escrow-backed transactions and safe milestone releases.', size: 'small' },
    { tag: 'Analytics', icon: '📈', cls: 'pink', title: 'Live Analytics',
      description: 'Track project status, proposals, and performance in real time.', size: 'small' },
    { tag: 'Global', icon: '🌐', cls: 'blue', title: 'Global Talent Network',
      description: 'Access a curated pool of freelancers across design, development, marketing, and more.', size: 'wide' }
  ];

  storySteps = [
    { num: '01', title: 'Find talent', desc: 'Browse a curated pool of world-class professionals ready to bring your vision to life.' },
    { num: '02', title: 'We match you instantly', desc: 'Our AI-powered system surfaces the ideal freelancer for your project in seconds — not days.' },
    { num: '03', title: 'Secure payment + subscription access', desc: 'Milestone-based escrow payments protect both sides. Unlock premium tools with a client subscription.' },
    { num: '04', title: 'Track work in real time', desc: 'Live dashboards give you full visibility on project progress, proposals, and performance metrics.' },
    { num: '05', title: 'Launch your project', desc: 'Ship with confidence. Every project backed by a community of 12,000+ professionals.' }
  ];

  testimonials = [
    { quote: 'NexLancer helped us go from idea to launch with incredible speed.',
      author: 'Arjun R.', role: 'CTO, BuildStack', initials: 'A', grad: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
    { quote: 'The matching system saved us weeks of hiring time.',
      author: 'Meera S.', role: 'Senior Product Designer', initials: 'M', grad: 'linear-gradient(135deg,#06b6d4,#7c3aed)' },
    { quote: 'The whole platform feels premium, secure, and easy to trust.',
      author: 'Kai T.', role: 'Founder, DesignFirst Studio', initials: 'K', grad: 'linear-gradient(135deg,#a855f7,#f472b6)' }
  ];

  subscriptionBenefits = [
    'Access premium freelancer listings',
    'Priority project matching',
    'Advanced analytics and hiring insights',
    'Escrow and secure collaboration tools',
    'Faster support and onboarding'
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private el: ElementRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.authService.getLoginStatus()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    /* ---- Intersection observer for reveal ---- */
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const targets = this.el.nativeElement.querySelectorAll('.reveal');
    targets.forEach((t: Element) => this.observer.observe(t));

    /* ---- Particle canvas ---- */
    this.canvas = this.canvasRef.nativeElement;
    const c2d = this.canvas.getContext('2d');
    if (c2d) {
      this.ctx = c2d;
      this.resizeCanvas();
      this.spawnParticles();
      this.ngZone.runOutsideAngular(() => this.animateParticles());
    }
  }

  ngOnDestroy(): void {
    if (this.observer) this.observer.disconnect();
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    document.body.style.overflow = '';
  }

  /* ============================================================
     PARTICLE SYSTEM
     ============================================================ */
  private resizeCanvas(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private spawnParticles(): void {
    this.particles = [];
    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      const color = this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 4 + 0.8,
        opacity: Math.random() * 8 + 0.08,
        color
      });
    }
  }

  private animateParticles(): void {
    const { ctx, canvas, particles, MAX_DIST } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Move + wrap */
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }

    /* Draw connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(94,210,156,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    /* Draw dots */
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.fill();
    }

    this.animFrame = requestAnimationFrame(() => this.animateParticles());
  }

  /* ============================================================
     CURSOR SPOTLIGHT
     ============================================================ */
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const spotlight = this.spotlightRef?.nativeElement;
    if (spotlight) {
      spotlight.style.setProperty('--sx', `${e.clientX}px`);
      spotlight.style.setProperty('--sy', `${e.clientY}px`);
      spotlight.style.opacity = '1';
    }
  }

  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    const spotlight = this.spotlightRef?.nativeElement;
    if (spotlight) spotlight.style.opacity = '0';
  }

  /* ============================================================
     SCROLL / NAV
     ============================================================ */
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 60;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.canvas) this.resizeCanvas();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  goToLogin(): void    { this.router.navigate(['/login']);    }
  goToRegister(): void { this.router.navigate(['/register']); }
}
