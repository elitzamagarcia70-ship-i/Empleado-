<script setup>
import { ref, computed, nextTick } from 'vue';
import JsBarcode from 'jsbarcode';
import { calcularRFC } from '@/utils/rfc';
import { guardarEmpleado } from '@/utils/empleados';

const nombre = ref('');
const paterno = ref('');
const materno = ref('');
const fecha = ref(null);
const hoy = new Date();
const calendario = ref(null); // referencia al DatePicker para mover su vista

// Listas para cambiar rápido el mes y el año dentro del calendario
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const opcionesMes = MESES.map((m, i) => ({ label: m, value: i }));
const opcionesAnio = Array.from({ length: hoy.getFullYear() - 1929 }, (_, i) => hoy.getFullYear() - i);

function cambiarFecha(anio, mes) {
    const base = fecha.value || new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0).getDate(); // evita 31 de febrero, etc.
    let nueva = new Date(anio, mes, Math.min(base.getDate(), ultimoDia));
    if (nueva > hoy) nueva = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    fecha.value = nueva;
    // Mueve la vista del calendario al mes y año elegidos
    nextTick(() => {
        if (calendario.value) {
            calendario.value.onMonthDropdownChange(nueva.getMonth());
            calendario.value.onYearDropdownChange(nueva.getFullYear());
        }
    });
}

const anioSeleccionado = computed({
    get: () => (fecha.value ? fecha.value.getFullYear() : null),
    set: (anio) => cambiarFecha(anio, fecha.value ? fecha.value.getMonth() : 0)
});
const mesSeleccionado = computed({
    get: () => (fecha.value ? fecha.value.getMonth() : null),
    set: (mes) => cambiarFecha(fecha.value ? fecha.value.getFullYear() : 1990, mes)
});
const rfc = ref('');
const tarjeta = ref(null);
const barcode = ref(null);
const enviado = ref(false);

async function generar() {
    enviado.value = true;
    if (!nombre.value || !paterno.value || !fecha.value) return;

    rfc.value = calcularRFC(nombre.value, paterno.value, materno.value, fecha.value);

    // Si el primer nombre termina en "a" se muestra "Empleada"
    const primerNombre = nombre.value.trim().split(' ')[0].toLowerCase();
    const puesto = primerNombre.endsWith('a') ? 'Empleada' : 'Empleado';

    tarjeta.value = {
        nombre: nombre.value.trim().toUpperCase(),
        apellidos: `${paterno.value} ${materno.value}`.trim().toUpperCase(),
        puesto,
        rfc: rfc.value
    };

    // Se guarda para la página de Gráficas
    const f = fecha.value;
    guardarEmpleado({
        ...tarjeta.value,
        anio: f.getFullYear(),
        mes: f.getMonth() + 1,
        fecha: `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`
    });

    await nextTick();
    JsBarcode(barcode.value, rfc.value, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 14,
        height: 50,
        width: 1.6,
        margin: 0,
        background: 'transparent'
    });
}
</script>

<template>
    <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- FORMULARIO -->
        <div class="card flex-1 w-full flex flex-col gap-4 mb-0">
            <div class="text-xl uppercase mb-2">Generar el RFC de una persona</div>

            <div class="flex flex-col gap-2">
                <label for="nombre">Nombre(s):</label>
                <InputText id="nombre" v-model="nombre" :invalid="enviado && !nombre" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="paterno">Apellido Paterno:</label>
                <InputText id="paterno" v-model="paterno" :invalid="enviado && !paterno" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="materno">Apellido Materno:</label>
                <InputText id="materno" v-model="materno" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="fecha">Fecha Nacimiento:</label>
                <DatePicker
                    ref="calendario"
                    id="fecha"
                    v-model="fecha"
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/aaaa"
                    showIcon
                    iconDisplay="input"
                    showButtonBar
                    :maxDate="hoy"
                    fluid
                    :invalid="enviado && !fecha"
                >
                    <template #header>
                        <div class="flex gap-2 pb-2 mb-2 border-b border-surface">
                            <Select v-model="mesSeleccionado" :options="opcionesMes" optionLabel="label" optionValue="value" placeholder="Mes" class="flex-1" appendTo="self" />
                            <Select v-model="anioSeleccionado" :options="opcionesAnio" placeholder="Año" class="w-28" scrollHeight="14rem" appendTo="self" />
                        </div>
                    </template>
                </DatePicker>
                <small class="text-muted-color">Tip: elige el mes y el año en las listas de arriba del calendario y luego da clic en el día.</small>
            </div>
            <div class="flex flex-col gap-2">
                <label for="rfc">RFC:</label>
                <InputText id="rfc" v-model="rfc" readonly />
            </div>

            <div>
                <Button label="GENERAR" class="btn-generar" @click="generar" />
            </div>
        </div>

        <!-- TARJETA DIGITAL -->
        <div class="card w-full lg:w-[26rem] shrink-0 mb-0">
            <div class="text-xl uppercase mb-4">Tarjeta Digital</div>

            <div class="gafete">
                <!-- Fondo con las ondas azules -->
                <svg class="fondo" viewBox="0 0 290 480" preserveAspectRatio="none">
                    <path d="M0 0 H290 V178 Q145 62 0 178 Z" fill="#1e88e5" />
                    <path d="M0 0 H290 V160 Q145 48 0 160 Z" fill="#0d47a1" />
                    <path d="M0 0 H290 V142 Q145 34 0 142 Z" fill="#0d2b52" />
                    <path d="M0 480 V420 Q150 372 290 410 V480 Z" fill="#42a5f5" />
                    <path d="M0 480 V432 Q150 392 290 425 V480 Z" fill="#1565c0" />
                    <path d="M0 480 V458 H290 V480 Z" fill="#0d2b52" />
                </svg>

                <!-- Logo -->
                <div class="logo">
                    <img src="/logo.webp" alt="Logo" class="logo-icono" />
                    <div>
                        <div class="empresa">ESCUELA DE TECNOLOGÍAS<br />DIGITALES APLICADAS</div>
                        <div class="slogan">Universidad Autónoma de Chiapas</div>
                    </div>
                </div>

                <!-- Foto -->
                <div class="foto">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="50" fill="#eef1f5" />
                        <circle cx="50" cy="38" r="17" fill="#0d1b2a" />
                        <path d="M33 40 Q31 62 40 62 L60 62 Q69 62 67 40 Q66 18 50 18 Q34 18 33 40 Z" fill="#0d1b2a" />
                        <path d="M18 100 Q18 70 42 66 L50 74 L58 66 Q82 70 82 100 Z" fill="#0d1b2a" />
                        <path d="M45 66 L50 74 L55 66 L52 64 L48 64 Z" fill="#fff" />
                        <path d="M49 74 L51 74 L52 92 L50 95 L48 92 Z" fill="#fff" />
                    </svg>
                </div>

                <!-- Datos -->
                <div class="datos">
                    <template v-if="tarjeta">
                        <div class="nombre">{{ tarjeta.nombre }}</div>
                        <div class="nombre">{{ tarjeta.apellidos }}</div>
                        <div class="puesto">{{ tarjeta.puesto }}</div>
                        <div class="id">ID : {{ tarjeta.rfc }}</div>
                        <svg ref="barcode" class="barcode"></svg>
                    </template>
                    <template v-else>
                        <div class="nombre">NOMBRE</div>
                        <div class="nombre">APELLIDOS</div>
                        <div class="puesto">Empleado</div>
                        <div class="id">ID : ----------</div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.btn-generar {
    background: #1565c0 !important;
    border: 2px solid #fff !important;
    box-shadow: 0 0 0 2px #1565c0 !important;
    color: #fff !important;
    font-weight: 700;
    width: 100%;
    max-width: 15rem;
}
.btn-generar:hover {
    background: #0d47a1 !important;
    box-shadow: 0 0 0 2px #0d47a1 !important;
}

.gafete {
    position: relative;
    width: 362px;
    max-width: 100%;
    height: 600px;
    margin: 0 auto;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}
.fondo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}
.logo {
    position: absolute;
    top: 26px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: #fff;
}
.logo-icono {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 50%;
}
.empresa {
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    line-height: 1.2;
}
.slogan {
    font-size: 0.8rem;
    opacity: 0.85;
}
.foto {
    position: absolute;
    top: 102px;
    left: 50%;
    transform: translateX(-50%);
    width: 156px;
    height: 156px;
    border-radius: 50%;
    border: 8px solid #fff;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}
.foto svg {
    width: 100%;
    height: 100%;
    display: block;
}
.datos {
    position: absolute;
    top: 278px;
    left: 0;
    right: 0;
    text-align: center;
    padding: 0 12px;
}
.nombre {
    font-size: 1.65rem;
    font-weight: 800;
    color: #0d2b52;
    line-height: 1.25;
}
.puesto {
    color: #8a8a8a;
    font-size: 1.3rem;
    margin: 6px 0 16px;
    letter-spacing: 0.5px;
}
.id {
    font-weight: 600;
    color: #0d2b52;
    letter-spacing: 0.5px;
    font-size: 1.15rem;
    margin-bottom: 12px;
}
.barcode {
    max-width: 100%;
}
</style>
