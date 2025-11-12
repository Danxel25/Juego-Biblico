import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors['passwordMismatch']) {
      // return if another validator has already found an error on the matchingControl
      return null;
    }

    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl?.setErrors(null);
      return null;
    }
  };
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styles: [`
    /* Oculta el icono de calendario por defecto en navegadores WebKit (Chrome, Safari) */
    input[type="date"]::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private authService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  isLoginView = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup;
  registerForm: FormGroup;

  biblicalNames = ['David', 'María', 'Pedro', 'Ester', 'Josué', 'Rut'];
  biblicalAdjectives = ['el Sabio', 'la Fiel', 'el Valiente', 'la Prudente', 'el Justo', 'la Compasiva'];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      customName: ['', [Validators.required, Validators.minLength(3)]],
    }, { validators: passwordMatchValidator('password', 'confirmPassword') });
    this.generateRandomName();

    effect(() => {
      if (this.isLoading()) {
        this.loginForm.disable();
        this.registerForm.disable();
      } else {
        this.loginForm.enable();
        this.registerForm.enable();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'inactivity') {
        this.errorMessage.set('Tu sesión ha sido cerrada por inactividad.');
      }
    });
  }

  toggleView(): void {
    this.isLoginView.update(v => !v);
    this.errorMessage.set(null);
    this.loginForm.reset();
    this.registerForm.reset();
    this.generateRandomName();
  }
  
  generateRandomName(): void {
    const name = this.biblicalNames[Math.floor(Math.random() * this.biblicalNames.length)];
    const adjective = this.biblicalAdjectives[Math.floor(Math.random() * this.biblicalAdjectives.length)];
    this.registerForm.patchValue({ customName: `${name} ${adjective}` });
  }

  async onSubmit(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    try {
      if (this.isLoginView()) {
        if (this.loginForm.invalid) {
          throw new Error("Por favor, introduce un correo y contraseña válidos.");
        }
        const { email, password } = this.loginForm.getRawValue();
        await this.authService.login(email!, password!);
      } else {
        if (this.registerForm.invalid) {
          throw new Error("Por favor, completa todos los campos de registro correctamente.");
        }
        const { email, password, customName } = this.registerForm.getRawValue();
        await this.authService.register(email!, password!, customName!);
        this.errorMessage.set('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.');
      }
    } catch (error) {
      this.handleAuthError(error);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  async onGuestLogin(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.guestLogin();
    } catch (error) {
      this.handleAuthError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleAuthError(error: unknown) {
    let message = 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo.';
    if (error instanceof Error) {
        // Supabase AuthError extends Error and has user-friendly messages.
        // We can translate some common ones for a better UX.
        switch (error.message) {
            case 'Invalid login credentials':
                message = 'Correo electrónico o contraseña incorrectos.';
                break;
            case 'User already registered':
                message = 'Este correo electrónico ya está registrado.';
                break;
            case 'Password should be at least 6 characters':
            case 'Password must be at least 6 characters':
                message = 'La contraseña debe tener al menos 6 caracteres.';
                break;
            case 'Unable to validate email address: invalid format':
                message = 'El formato del correo electrónico no es válido.';
                break;
            default:
                if (error.message.includes('rate limit')) {
                    message = 'Demasiados intentos. Por favor, espere un momento.';
                } else if (error.message.includes('Email not confirmed')) {
                    message = 'Tu correo electrónico aún no ha sido confirmado. Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de verificación.';
                } else {
                    message = error.message; // Fallback to the original Supabase message
                }
        }
    }
    this.errorMessage.set(message);
  }
}
