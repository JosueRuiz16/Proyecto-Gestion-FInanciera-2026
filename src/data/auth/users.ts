/**
 * USUARIOS DEL SISTEMA (MODO DEMOSTRATIVO ACADÉMICO)
 *
 * Decisión técnica: la autenticación es local (sin servidor) para que la app funcione
 * sin internet durante la defensa. Las contraseñas son deliberadamente sencillas porque
 * se trata de un entorno de demostración. En una versión productiva se reemplazaría por
 * Supabase Auth (contraseñas cifradas en el servidor + políticas RLS por usuario).
 *
 * Contraseña de cada usuario: nombre en minúsculas + "123"  (ej. josue123, admin123)
 */

export type UserRole = 'ADMIN' | 'ESTUDIANTE';

export interface AppUser {
  id: string; // Identificador estable: se usa como llave del presupuesto personal
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  /** Posición de recorte en el avatar (object-position CSS, ej. '52% 62%') */
  avatarPosition?: string;
}

interface UserRecord extends AppUser {
  password: string;
}

const baseUrl = import.meta.env.BASE_URL;

const USER_RECORDS: UserRecord[] = [
  {
    id: 'josue',
    username: 'josue',
    displayName: 'Josue',
    role: 'ESTUDIANTE',
    password: 'josue123',
    avatarUrl: `${baseUrl}avatars/josue.jpg`,
    avatarPosition: '52% 60%',
  },
  {
    id: 'alejandra',
    username: 'alejandra',
    displayName: 'Alejandra',
    role: 'ESTUDIANTE',
    password: 'alejandra123',
    avatarUrl: `${baseUrl}avatars/alejandra.jpg`,
    avatarPosition: '46% 36%',
  },
  {
    id: 'dulce',
    username: 'dulce',
    displayName: 'Dulce',
    role: 'ESTUDIANTE',
    password: 'dulce123',
    avatarUrl: `${baseUrl}avatars/dulce.jpg`,
    avatarPosition: '42% 30%',
  },
  {
    id: 'itzy',
    username: 'itzy',
    displayName: 'Itzy',
    role: 'ESTUDIANTE',
    password: 'itzy123',
    avatarUrl: `${baseUrl}avatars/itzy.png`,
    avatarPosition: '64% 52%',
  },
  {
    id: 'esteban',
    username: 'esteban',
    displayName: 'Esteban',
    role: 'ESTUDIANTE',
    password: 'esteban123',
    avatarUrl: `${baseUrl}avatars/esteban.png`,
    avatarPosition: '46% 28%',
  },
  { id: 'admin', username: 'admin', displayName: 'Admin', role: 'ADMIN', password: 'admin123' },
];

/** Lista pública de usuarios (sin contraseñas). */
export const APP_USERS: AppUser[] = USER_RECORDS.map(({ password: _pw, ...user }) => user);

export type AuthResult =
  | { ok: true; user: AppUser }
  | { ok: false; error: string };

/**
 * Valida credenciales. El usuario no distingue mayúsculas/minúsculas ni espacios
 * alrededor; la contraseña sí es exacta.
 */
export function authenticateUser(username: string, password: string): AuthResult {
  const normalized = username.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false, error: 'Ingresa tu usuario y contraseña.' };
  }
  const record = USER_RECORDS.find((u) => u.username === normalized);
  if (!record || record.password !== password) {
    return { ok: false, error: 'Usuario o contraseña incorrectos.' };
  }
  const { password: _pw, ...user } = record;
  return { ok: true, user };
}

export function findUserById(id: string | null | undefined): AppUser | null {
  return APP_USERS.find((u) => u.id === id) ?? null;
}

export function findUserByUsername(username: string | null | undefined): AppUser | null {
  const normalized = (username ?? '').trim().toLowerCase();
  if (!normalized) return null;
  return APP_USERS.find((u) => u.username === normalized) ?? null;
}
