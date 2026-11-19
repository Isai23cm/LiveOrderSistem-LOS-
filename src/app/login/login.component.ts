import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  passwordVisible = false;
  showRecoveryMessage = false;
  errorMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    pageTitle: Title,
  ) {
    pageTitle.setTitle('Iniciar sesión | BistroOS');
  }

  submit(): void {
    this.errorMessage = '';

    if (!this.auth.login(this.email, this.password)) {
      this.errorMessage = 'Correo o contraseña incorrectos.';
      return;
    }

    void this.router.navigateByUrl('/');
  }
}