import {
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(AuthService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get disabled(): boolean {
    return this.form.invalid || this.loading();
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    const raw = this.form.getRawValue();

    const payload = {
      id: null,
      name: raw.name,
      email: raw.email,
      role: 'USER',
      password: raw.password
    };

    // this.loginService.register(payload).subscribe({
    //   next: () => {
    //     this.loading.set(false);
    //   },
    //   error: () => {
    //     this.loading.set(false);
    //   }
    // });
  }
}
