<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import JsBarcode from 'jsbarcode';

const texto = ref('ROMS920822JK7');
const barcode = ref(null);

// El QR se genera con el servicio gratuito api.qrserver.com (necesita internet)
const urlQR = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(texto.value || ' ')}`);

function dibujarBarras() {
    if (!barcode.value || !texto.value) return;
    JsBarcode(barcode.value, texto.value, { format: 'CODE128', height: 70, fontSize: 14, background: 'transparent' });
}

onMounted(dibujarBarras);
watch(texto, dibujarBarras);
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="card mb-0">
            <div class="text-xl uppercase mb-4">Generador de código de barras y QR</div>
            <div class="flex flex-col gap-2">
                <label for="texto">Texto o RFC:</label>
                <InputText id="texto" v-model="texto" placeholder="Escribe un texto" />
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-6">
            <div class="card flex-1 mb-0 flex flex-col items-center gap-4">
                <div class="text-lg uppercase self-start">Código de barras</div>
                <svg ref="barcode" class="max-w-full"></svg>
            </div>
            <div class="card flex-1 mb-0 flex flex-col items-center gap-4">
                <div class="text-lg uppercase self-start">Código QR</div>
                <img v-if="texto" :src="urlQR" alt="Código QR" width="220" height="220" />
            </div>
        </div>
    </div>
</template>
