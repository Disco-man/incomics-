<template>
  <ion-page>
    <ion-content class="ion-padding">

      <!-- Logo / Header -->
      <div class="ion-text-center ion-padding-vertical">
        <ion-icon
          name="book-outline"
          color="primary"
          style="font-size: 64px;"
          aria-hidden="true"
        />
        <ion-text color="primary">
          <h1 class="ion-no-margin">INCOMICS</h1>
        </ion-text>
        <ion-text color="medium">
          <p class="ion-no-margin">Мүмкіндігі шектеулі оқырмандарға арналған комикс платформасы</p>
        </ion-text>
      </div>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Жүйеге кіру</ion-card-title>
          <ion-card-subtitle>Аккаунтыңызға кіріңіз</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list lines="full">
            <ion-item>
              <ion-icon slot="start" name="person-outline" aria-hidden="true" />
              <ion-input
                v-model="loginInput"
                type="text"
                label="Логин немесе Email"
                label-placement="floating"
                placeholder="torgyn"
                autocomplete="username"
                aria-label="Логин немесе Email"
                :clear-input="true"
              />
            </ion-item>

            <ion-item>
              <ion-icon slot="start" name="lock-closed-outline" aria-hidden="true" />
              <ion-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Құпиясөз"
                label-placement="floating"
                placeholder="••••••••"
                autocomplete="current-password"
                aria-label="Құпиясөз"
              />
              <ion-button
                slot="end"
                fill="clear"
                size="small"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Құпиясөзді жасыру' : 'Құпиясөзді көрсету'"
              >
                <ion-icon :name="showPassword ? 'eye-off-outline' : 'eye-outline'" slot="icon-only" />
              </ion-button>
            </ion-item>
          </ion-list>

          <ion-text color="danger" v-if="errorMsg">
            <p class="ion-padding-start" role="alert">{{ errorMsg }}</p>
          </ion-text>

          <div class="ion-padding-top">
            <ion-button
              expand="block"
              size="large"
              :disabled="loading"
              @click="handleLogin"
              aria-label="Кіру батырмасы"
            >
              <ion-spinner v-if="loading" name="crescent" slot="start" />
              <ion-icon v-else name="log-in-outline" slot="start" />
              Кіру
            </ion-button>
          </div>

          <div class="ion-padding-top ion-text-center">
            <ion-text color="medium">
              <p>Аккаунтыңыз жоқ па?</p>
            </ion-text>
            <ion-button fill="clear" router-link="/register" aria-label="Тіркелу бетіне өту">
              Тіркелу
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Accessibility note -->
      <ion-card color="light">
        <ion-card-content>
          <ion-item lines="none">
            <ion-icon name="accessibility-outline" slot="start" color="primary" />
            <ion-label class="ion-text-wrap">
              <ion-text color="medium">
                <small>Бұл платформа зағип, саңырау және мүмкіндігі шектеулі пайдаланушыларға бейімделген. Screen reader қолдауы бар.</small>
              </ion-text>
            </ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonList, IonItem, IonInput, IonButton, IonIcon, IonText,
  IonLabel, IonSpinner
} from '@ionic/vue';

const router = useRouter();
const loginInput = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

async function handleLogin() {
  errorMsg.value = '';
  if (!loginInput.value || !password.value) {
    errorMsg.value = 'Логин мен құпиясөзді енгізіңіз.';
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginInput.value, password: password.value }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorMsg.value = data.error || 'Кіру қатесі';
      return;
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/tabs/home');
  } catch {
    errorMsg.value = 'Серверге қосылу мүмкін емес';
  } finally {
    loading.value = false;
  }
}
</script>
