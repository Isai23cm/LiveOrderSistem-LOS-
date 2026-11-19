import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosMesero, Mesero } from './personal.models';
import { PersonalService } from './personal.service';

@Component({
  selector: 'app-personal',
  imports: [ReactiveFormsModule],
  templateUrl: './personal.html',
  styleUrl: './personal.css',
})
export class Personal {
  private readonly personalService = inject(PersonalService);

  protected readonly meseros = this.personalService.meseros;
  protected readonly meserosActivos = computed(
    () => this.meseros().filter((mesero) => mesero.activo).length,
  );
  protected readonly editandoId = signal<string | null>(null);
  protected readonly mensaje = signal('');
  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    avatarUrl: new FormControl('', { nonNullable: true }),
  });

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos: DatosMesero = this.formulario.getRawValue();
    const id = this.editandoId();

    if (id) {
      this.personalService.editar(id, datos);
      this.mensaje.set('Datos del mesero actualizados.');
    } else {
      this.personalService.agregar(datos);
      this.mensaje.set('Mesero agregado al equipo.');
    }

    this.cancelarEdicion();
  }

  protected editar(mesero: Mesero): void {
    this.editandoId.set(mesero.id);
    this.formulario.setValue({ nombre: mesero.nombre, avatarUrl: mesero.avatarUrl });
    this.mensaje.set('');
  }

  protected desactivar(mesero: Mesero): void {
    this.personalService.desactivar(mesero.id);
    this.mensaje.set(`${mesero.nombre} fue desactivado.`);
    if (this.editandoId() === mesero.id) {
      this.cancelarEdicion();
    }
  }

  protected cancelarEdicion(): void {
    this.editandoId.set(null);
    this.formulario.reset({ nombre: '', avatarUrl: '' });
  }

  protected iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((parte) => parte[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
