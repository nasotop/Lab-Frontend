// login.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { LoginRequest } from '../model/login-request';
import { Router } from '@angular/router';
import { ResultDto } from '../../../shared/model/result-dto';
import { LoginResponse } from '../model/login-response';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly formValid = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    this.form.statusChanges.subscribe(() => {
      this.formValid.set(this.form.valid);
    });
  }

  readonly disabled = computed(() => !this.formValid() || this.loading());

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const value = this.form.getRawValue();

    const request: LoginRequest = {
      email: value.email,
      password: value.password,
    };

    this.loginService.login(request).subscribe({
      next: (res: ResultDto<LoginResponse>) => {
        const data = res.data;

        if (data && data.token) {
          this.loginService.saveToken(data.token);
          this.loading.set(false);
          this.router.navigate(['/test-results']);
        } else {
          this.loading.set(false);
          // Optionally handle the error case here
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
