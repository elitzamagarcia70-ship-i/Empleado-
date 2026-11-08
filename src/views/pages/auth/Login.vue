<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { iniciarSesion } from '@/utils/auth';

const router = useRouter();
const route = useRoute();

const usuario = ref('');
const password = ref('');
const error = ref('');
const enviado = ref(false);

function entrar() {
    enviado.value = true;
    error.value = '';
    if (!usuario.value || !password.value) return;

    if (iniciarSesion(usuario.value, password.value)) {
        router.push(route.query.redirect && route.query.redirect !== '/' ? route.query.redirect : '/formClientes');
    } else {
        error.value = 'Usuario o contraseña incorrectos';
    }
}
</script>

<template>
    <div class="login-fondo flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden p-4">
        <div class="w-full max-w-md bg-surface-0 dark:bg-surface-900 rounded-3xl shadow-xl overflow-hidden">
            <div class="login-encabezado text-center text-white py-10 px-6">
                <img src="/logo.webp" alt="Logo" class="w-24 h-24 mx-auto mb-4 object-cover rounded-full" />
                <div class="text-2xl font-bold">Escuela de Tecnologías Digitales Aplicadas</div>
                <div class="opacity-90">Universidad Autónoma de Chiapas</div>
            </div>

            <form class="flex flex-col gap-4 p-8" @submit.prevent="entrar">
                <div class="text-xl font-semibold text-center mb-2">Iniciar sesión</div>

                <div class="flex flex-col gap-2">
                    <label for="usuario" class="font-medium">Usuario</label>
                    <IconField>
                        <InputIcon class="pi pi-user" />
                        <InputText id="usuario" v-model="usuario" placeholder="Usuario" class="w-full" :invalid="enviado && !usuario" />
                    </IconField>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="password" class="font-medium">Contraseña</label>
                    <Password id="password" v-model="password" placeholder="Contraseña" toggleMask fluid :feedback="false" :invalid="enviado && !password" />
                </div>

                <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

                <Button type="submit" label="Entrar" icon="pi pi-sign-in" class="btn-entrar w-full mt-2" />

            </form>
        </div>
    </div>
</template>

<style scoped>
.login-fondo {
    background: linear-gradient(135deg, #0d2b52 0%, #1565c0 60%, #42a5f5 100%);
}
.login-encabezado {
    background: #0d2b52;
    border-bottom-left-radius: 50% 20%;
    border-bottom-right-radius: 50% 20%;
}
.btn-entrar {
    background: #1565c0 !important;
    border: 2px solid #fff !important;
    box-shadow: 0 0 0 2px #1565c0 !important;
    color: #fff !important;
    font-weight: 700;
}
.btn-entrar:hover {
    background: #0d47a1 !important;
    box-shadow: 0 0 0 2px #0d47a1 !important;
}
</style>
