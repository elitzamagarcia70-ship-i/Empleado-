// Inicio de sesión sencillo (sin servidor): los usuarios están aquí
// y la sesión se guarda en el navegador (sessionStorage).

const USUARIOS = [
    { usuario: 'admin', password: 'admin123', nombre: 'Administrador' }
];

const CLAVE = 'sesionUsuario';

export function iniciarSesion(usuario, password) {
    const encontrado = USUARIOS.find((u) => u.usuario === usuario.trim().toLowerCase() && u.password === password);
    if (!encontrado) return false;
    sessionStorage.setItem(CLAVE, JSON.stringify({ usuario: encontrado.usuario, nombre: encontrado.nombre }));
    return true;
}

export function cerrarSesion() {
    sessionStorage.removeItem(CLAVE);
}

export function usuarioActual() {
    try {
        return JSON.parse(sessionStorage.getItem(CLAVE));
    } catch {
        return null;
    }
}

export function estaAutenticado() {
    return !!usuarioActual();
}
