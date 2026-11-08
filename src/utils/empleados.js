// Guarda en el navegador (localStorage) los empleados que se generan en "Demo Clientes"
// para poder mostrarlos en la página de Gráficas.

const CLAVE = 'empleadosGenerados';

export function obtenerEmpleados() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch {
        return [];
    }
}

export function guardarEmpleado(empleado) {
    const lista = obtenerEmpleados().filter((e) => e.rfc !== empleado.rfc); // sin repetidos
    lista.push({ ...empleado, fechaRegistro: new Date().toISOString() });
    try {
        localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch {
        /* si el navegador no deja guardar, no pasa nada */
    }
}

export function borrarEmpleados() {
    try {
        localStorage.removeItem(CLAVE);
    } catch {
        /* nada */
    }
}
