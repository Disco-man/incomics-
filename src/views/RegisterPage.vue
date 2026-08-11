<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/login" aria-label="Артқа қайту" />
        </ion-buttons>
        <ion-title>Тіркелу</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <ion-card>
        <ion-card-header>
          <ion-card-title>Жаңа аккаунт</ion-card-title>
          <ion-card-subtitle>Платформаға тіркеліңіз</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list lines="full">

            <ion-item>
              <ion-icon slot="start" name="at-outline" aria-hidden="true" />
              <ion-input
                v-model="form.username"
                type="text"
                label="Логин"
                label-placement="floating"
                placeholder="Логиніңіз"
                autocomplete="username"
                aria-label="Логин"
                :clear-input="true"
              />
            </ion-item>

            <ion-item>
              <ion-icon slot="start" name="person-outline" aria-hidden="true" />
              <ion-input
                v-model="form.name"
                type="text"
                label="Аты-жөні"
                label-placement="floating"
                placeholder="Есіміңіз"
                autocomplete="name"
                aria-label="Толық аты-жөніңіз"
                :clear-input="true"
              />
            </ion-item>

            <ion-item>
              <ion-icon slot="start" name="mail-outline" aria-hidden="true" />
              <ion-input
                v-model="form.email"
                type="email"
                label="Email"
                label-placement="floating"
                placeholder="example@mail.com"
                autocomplete="email"
                inputmode="email"
                aria-label="Email мекенжайы"
                :clear-input="true"
              />
            </ion-item>

            <ion-item>
              <ion-icon slot="start" name="call-outline" aria-hidden="true" />
              <ion-input
                v-model="form.phone"
                type="tel"
                label="Телефон (міндетті емес)"
                label-placement="floating"
                placeholder="+7 700 000 0000"
                autocomplete="tel"
                inputmode="tel"
                aria-label="Телефон нөмірі"
                :clear-input="true"
              />
            </ion-item>

            <ion-item>
              <ion-icon slot="start" name="lock-closed-outline" aria-hidden="true" />
              <ion-input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                label="Құпиясөз"
                label-placement="floating"
                placeholder="Кемінде 8 таңба"
                autocomplete="new-password"
                aria-label="Жаңа құпиясөз"
              />
              <ion-button
                slot="end" fill="clear" size="small"
                @click="showPass = !showPass"
                :aria-label="showPass ? 'Жасыру' : 'Көрсету'"
              >
                <ion-icon :name="showPass ? 'eye-off-outline' : 'eye-outline'" slot="icon-only" />
              </ion-button>
            </ion-item>

            <ion-item>
              <ion-icon slot="start" name="shield-checkmark-outline" aria-hidden="true" />
              <ion-input
                v-model="form.confirm"
                :type="showConfirm ? 'text' : 'password'"
                label="Құпиясөзді растау"
                label-placement="floating"
                placeholder="Қайта енгізіңіз"
                autocomplete="new-password"
                aria-label="Құпиясөзді растаңыз"
              />
              <ion-button
                slot="end" fill="clear" size="small"
                @click="showConfirm = !showConfirm"
                :aria-label="showConfirm ? 'Жасыру' : 'Көрсету'"
              >
                <ion-icon :name="showConfirm ? 'eye-off-outline' : 'eye-outline'" slot="icon-only" />
              </ion-button>
            </ion-item>

          </ion-list>

          <!-- Accessibility needs -->
          <ion-item class="ion-margin-top">
            <ion-icon slot="start" name="accessibility-outline" aria-hidden="true" />
            <ion-label>Қажеттіліктерім</ion-label>
          </ion-item>
          <ion-list>
            <ion-item>
              <ion-checkbox v-model="form.isDeaf" aria-label="Саңырау / Есту қабілеті нашар">
                Саңырау / Есту қабілеті нашар
              </ion-checkbox>
            </ion-item>
            <ion-item>
              <ion-checkbox v-model="form.isBlind" aria-label="Зағип / Көру қабілеті нашар">
                Зағип / Көру қабілеті нашар
              </ion-checkbox>
            </ion-item>
            <ion-item>
              <ion-checkbox v-model="form.needsLargeText" aria-label="Үлкен шрифт қажет">
                Үлкен шрифт қажет
              </ion-checkbox>
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
              @click="handleRegister"
              aria-label="Тіркелу батырмасы"
            >
              <ion-spinner v-if="loading" name="crescent" slot="start" />
              <ion-icon v-else name="person-add-outline" slot="start" />
              Тіркелу
            </ion-button>
          </div>

          <div class="ion-padding-top ion-text-center">
            <ion-text color="medium"><p>Аккаунтыңыз бар ма?</p></ion-text>
            <ion-button fill="clear" router-link="/login" aria-label="Кіру бетіне өту">
              Кіру
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonList, IonItem, IonInput, IonButton, IonIcon,
  IonText, IonLabel, IonSpinner, IonCheckbox
} from '@ionic/vue';

const router = useRouter();
const showPass = ref(false);
const showConfirm = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const form = reactive({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  isDeaf: false,
  isBlind: false,
  needsLargeText: false,
});

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

async function handleRegister() {
  errorMsg.value = '';
  if (!form.username || !form.name || !form.email || !form.password) {
    errorMsg.value = 'Барлық міндетті өрістерді толтырыңыз.';
    return;
  }
  if (form.password !== form.confirm) {
    errorMsg.value = 'Құпиясөздер сәйкес келмейді.';
    return;
  }
  if (form.password.length < 5) {
    errorMsg.value = 'Құпиясөз кемінде 5 таңбадан тұруы керек.';
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        isDeaf: form.isDeaf,
        isBlind: form.isBlind,
        needsLargeText: form.needsLargeText,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorMsg.value = data.error || 'Тіркелу қатесі';
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
