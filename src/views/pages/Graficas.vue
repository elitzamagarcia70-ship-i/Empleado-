<script setup>
import { ref, computed } from 'vue';
import { obtenerEmpleados, borrarEmpleados } from '@/utils/empleados';

const empleados = ref(obtenerEmpleados());

const AZULES = ['#0d2b52', '#1565c0', '#1e88e5', '#42a5f5', '#90caf9', '#0d47a1'];

const total = computed(() => empleados.value.length);
const mujeres = computed(() => empleados.value.filter((e) => e.puesto === 'Empleada').length);
const hombres = computed(() => total.value - mujeres.value);
const edadPromedio = computed(() => {
    if (!total.value) return 0;
    const hoy = new Date();
    const suma = empleados.value.reduce((s, e) => s + (hoy.getFullYear() - Number(e.anio)), 0);
    return Math.round(suma / total.value);
});

// Gráfica de dona: empleadas vs empleados
const datosSexo = computed(() => ({
    labels: ['Empleadas', 'Empleados'],
    datasets: [{ data: [mujeres.value, hombres.value], backgroundColor: ['#42a5f5', '#0d2b52'] }]
}));

// Gráfica de barras: por década de nacimiento
const datosDecada = computed(() => {
    const conteo = {};
    empleados.value.forEach((e) => {
        const decada = `${Math.floor(Number(e.anio) / 10) * 10}s`;
        conteo[decada] = (conteo[decada] || 0) + 1;
    });
    const etiquetas = Object.keys(conteo).sort();
    return {
        labels: etiquetas,
        datasets: [{ label: 'Empleados', data: etiquetas.map((d) => conteo[d]), backgroundColor: '#1565c0', borderRadius: 6 }]
    };
});

// Gráfica de barras horizontales: por mes de nacimiento
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const datosMes = computed(() => {
    const conteo = Array(12).fill(0);
    empleados.value.forEach((e) => conteo[Number(e.mes) - 1]++);
    return {
        labels: MESES,
        datasets: [{ label: 'Cumpleaños', data: conteo, backgroundColor: AZULES[3], borderColor: AZULES[1], borderWidth: 1, borderRadius: 4 }]
    };
});

const opcionesBarras = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
};
const opcionesDona = { plugins: { legend: { position: 'bottom' } } };

function limpiar() {
    borrarEmpleados();
    empleados.value = [];
}
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <!-- Indicadores -->
        <div class="col-span-12 md:col-span-4">
            <div class="card mb-0 flex items-center gap-4">
                <i class="pi pi-users text-3xl text-blue-700"></i>
                <div>
                    <div class="text-muted-color">Tarjetas generadas</div>
                    <div class="text-3xl font-bold">{{ total }}</div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-4">
            <div class="card mb-0 flex items-center gap-4">
                <i class="pi pi-venus text-3xl text-blue-400"></i>
                <div>
                    <div class="text-muted-color">Empleadas / Empleados</div>
                    <div class="text-3xl font-bold">{{ mujeres }} / {{ hombres }}</div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-4">
            <div class="card mb-0 flex items-center gap-4">
                <i class="pi pi-calendar text-3xl text-blue-900"></i>
                <div>
                    <div class="text-muted-color">Edad promedio</div>
                    <div class="text-3xl font-bold">{{ edadPromedio }} años</div>
                </div>
            </div>
        </div>

        <!-- Sin datos -->
        <div v-if="!total" class="col-span-12">
            <div class="card mb-0 text-center py-10">
                <i class="pi pi-chart-bar text-5xl text-blue-700 mb-4"></i>
                <div class="text-xl mb-2">Todavía no hay datos</div>
                <div class="text-muted-color mb-4">Genera algunas tarjetas en <b>Demo Clientes</b> y aquí aparecerán las gráficas.</div>
                <Button label="Ir a Demo Clientes" icon="pi pi-id-card" as="router-link" to="/formClientes" />
            </div>
        </div>

        <!-- Gráficas -->
        <template v-else>
            <div class="col-span-12 xl:col-span-4">
                <div class="card mb-0 h-full">
                    <div class="font-semibold text-xl mb-4">Empleadas vs Empleados</div>
                    <Chart type="doughnut" :data="datosSexo" :options="opcionesDona" class="max-w-xs mx-auto" />
                </div>
            </div>
            <div class="col-span-12 xl:col-span-8">
                <div class="card mb-0 h-full">
                    <div class="font-semibold text-xl mb-4">Empleados por década de nacimiento</div>
                    <Chart type="bar" :data="datosDecada" :options="opcionesBarras" />
                </div>
            </div>
            <div class="col-span-12">
                <div class="card mb-0">
                    <div class="font-semibold text-xl mb-4">Cumpleaños por mes</div>
                    <Chart type="bar" :data="datosMes" :options="opcionesBarras" class="h-72" />
                </div>
            </div>

            <!-- Tabla de empleados -->
            <div class="col-span-12">
                <div class="card mb-0">
                    <div class="flex justify-between items-center mb-4">
                        <div class="font-semibold text-xl">Empleados registrados</div>
                        <Button label="Borrar datos" icon="pi pi-trash" severity="danger" text @click="limpiar" />
                    </div>
                    <DataTable :value="empleados" paginator :rows="5" stripedRows>
                        <Column field="nombre" header="Nombre" />
                        <Column field="apellidos" header="Apellidos" />
                        <Column field="puesto" header="Puesto" />
                        <Column field="fecha" header="Nacimiento" />
                        <Column field="rfc" header="RFC" />
                    </DataTable>
                </div>
            </div>
        </template>
    </div>
</template>
