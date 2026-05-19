import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit, OnDestroy {
  loading = false;
  userId = 0;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    if (!this.authService.getLoginStatus()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.authService.isSubscribed()) {
      this.router.navigate(['/job-create']);
      return;
    }

    this.loadRazorpayScript();
  }

  private loadRazorpayScript(): void {
    if (document.getElementById('razorpay-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
  }

  subscribe(): void {
    this.loading = true;
    // this.error = '';
    // this.message = '';

    this.authService.createSubscriptionOrder(this.userId).subscribe({
      next: (order) => {
        this.loading = false;

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'NexLancer',
          description: 'Client Subscription — Post Unlimited Jobs',
          order_id: order.orderId,
          handler: (response: any) => {
            this.onPaymentSuccess(response);
          },
          prefill: {},
          theme: { color: '#7c3aed' },
          modal: {
            ondismiss: () => {
              this.showToast('Payment cancelled. You can try again anytime.', 'info');
            }
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.error?.error || 'Failed to initiate payment. Please try again.', 'error');
      }
    });
  }

  ngOnDestroy(): void { if (this.toastTimer) clearTimeout(this.toastTimer); }

  showToast(message: string, type: 'success'|'error'|'info'|'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4500);
  }
  dismissToast(): void { this.toastVisible = false; }

  private onPaymentSuccess(response: any): void {
    this.loading = true;
    // this.error = '';

    const payload = {
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      signature: response.razorpay_signature,
      userId: this.userId
    };

    this.authService.verifySubscriptionPayment(payload).subscribe({
      next: () => {
        this.loading = false;
        this.authService.setSubscribed(true);
        this.showToast('🎉 Subscription activated! Redirecting to Post a Job...', 'success');
        setTimeout(() => this.router.navigate(['/job-create']), 1800);
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.error?.error || 'Payment verification failed. Please contact support.', 'error');
      }
    });
  }
}