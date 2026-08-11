<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Профиль</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openEditModal" aria-label="Профильді өңдеу">
            <ion-icon slot="icon-only" name="create-outline" />
          </ion-button>
          <ion-button @click="handleLogout" aria-label="Шығу">
            <ion-icon slot="icon-only" name="log-out-outline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>

      <!-- Avatar section -->
      <div class="ion-text-center ion-padding">
        <ion-avatar style="width:96px;height:96px;margin:0 auto;">
          <img :src="avatarUrl" :alt="user.name + ' профиль суреті'" />
        </ion-avatar>
        <ion-text color="primary">
          <h2 class="ion-no-margin ion-padding-top">{{ user.name }}</h2>
        </ion-text>
        <ion-text color="medium">
          <p class="ion-no-margin">{{ user.email }}</p>
        </ion-text>
        <ion-chip color="success" class="ion-margin-top" aria-label="Белсенді мүше">
          <ion-icon name="checkmark-circle-outline" />
          <ion-label>Белсенді мүше</ion-label>
        </ion-chip>
      </div>

      <!-- Admin Panel Button -->
      <div v-if="user.role === 'admin'" class="ion-padding-horizontal ion-padding-bottom">
        <ion-button expand="block" color="tertiary" router-link="/admin">
          <ion-icon slot="start" name="settings-outline" />
          Комикс Конструкторы (Админ)
        </ion-button>
      </div>

      <!-- Accessibility settings -->
      <ion-list-header>
        <ion-label>
          <ion-icon name="accessibility-outline" class="ion-margin-end" />
          Қолжетімділік баптаулары
        </ion-label>
      </ion-list-header>

      <ion-list inset>
        <ion-item>
          <ion-icon slot="start" :name="isDark ? 'moon-outline' : 'sunny-outline'" color="primary" />
          <ion-label>{{ isDark ? 'Қараңғы тема' : 'Жарық тема' }}</ion-label>
          <ion-toggle :checked="isDark" @ionChange="e => { toggleTheme(); saveA11ySettings(); }" aria-label="Тема ауыстыру" />
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="volume-high-outline" color="primary" />
          <ion-label>Аудио озвучка</ion-label>
          <ion-toggle v-model="settings.audioEnabled" @ionChange="saveA11ySettings" aria-label="Аудио озвучканы қосу/өшіру" />
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="text-outline" color="primary" />
          <ion-label>Үлкен шрифт</ion-label>
          <ion-toggle v-model="settings.largeText" @ionChange="saveA11ySettings" aria-label="Үлкен шрифт режимі" />
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="contrast-outline" color="primary" />
          <ion-label>Жоғары контраст</ion-label>
          <ion-toggle v-model="settings.highContrast" @ionChange="saveA11ySettings" aria-label="Жоғары контраст режимі" />
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="hand-left-outline" color="primary" />
          <ion-label>Вибрация кері байланысы</ion-label>
          <ion-toggle v-model="settings.haptic" @ionChange="saveA11ySettings" aria-label="Вибрация кері байланысы" />
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="speedometer-outline" color="primary" />
          <ion-label>Аудио жылдамдығы</ion-label>
          <ion-select
            v-model="settings.audioSpeed"
            @ionChange="saveA11ySettings"
            interface="action-sheet"
            aria-label="Аудио жылдамдығын таңдаңыз"
          >
            <ion-select-option value="0.5">0.5x (Баяу)</ion-select-option>
            <ion-select-option value="0.75">0.75x</ion-select-option>
            <ion-select-option value="1">1x (Қалыпты)</ion-select-option>
            <ion-select-option value="1.25">1.25x</ion-select-option>
            <ion-select-option value="1.5">1.5x (Жылдам)</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <!-- Disability profile -->
      <ion-list-header>
        <ion-label>
          <ion-icon name="person-outline" class="ion-margin-end" />
          Мүмкіндік шектеулері
        </ion-label>
      </ion-list-header>

      <ion-list inset>
        <ion-item>
          <ion-icon slot="start" name="ear-outline" color="warning" />
          <ion-label>Есту қабілеті</ion-label>
          <ion-chip
            slot="end"
            :color="user.isDeaf ? 'warning' : 'success'"
            :aria-label="user.isDeaf ? 'Есту қабілеті шектеулі' : 'Есту қабілеті қалыпты'"
          >
            {{ user.isDeaf ? 'Саңырау / Нашар' : 'Қалыпты' }}
          </ion-chip>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="eye-outline" color="warning" />
          <ion-label>Көру қабілеті</ion-label>
          <ion-chip
            slot="end"
            :color="user.isBlind ? 'warning' : 'success'"
            :aria-label="user.isBlind ? 'Көру қабілеті шектеулі' : 'Көру қабілеті қалыпты'"
          >
            {{ user.isBlind ? 'Зағип / Нашар' : 'Қалыпты' }}
          </ion-chip>
        </ion-item>
      </ion-list>

      <!-- Reading stats -->
      <ion-list-header>
        <ion-label>
          <ion-icon name="bar-chart-outline" class="ion-margin-end" />
          Оқу статистикасы
        </ion-label>
      </ion-list-header>

      <ion-list inset>
        <ion-item>
          <ion-icon slot="start" name="book-outline" color="primary" />
          <ion-label>Оқылған комикстер</ion-label>
          <ion-badge slot="end" color="primary" aria-label="3 комикс оқылды">3</ion-badge>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="time-outline" color="primary" />
          <ion-label>Оқу уақыты</ion-label>
          <ion-note slot="end">2 сағат 15 минут</ion-note>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="bookmark-outline" color="primary" />
          <ion-label>Бетбелгілер</ion-label>
          <ion-badge slot="end" color="secondary" aria-label="5 бетбелгі">5</ion-badge>
        </ion-item>
      </ion-list>

      <!-- Logout -->
      <div class="ion-padding">
        <ion-button
          expand="block"
          color="danger"
          fill="outline"
          @click="handleLogout"
          aria-label="Жүйеден шығу"
        >
          <ion-icon slot="start" name="log-out-outline" />
          Жүйеден шығу
        </ion-button>
      </div>

    </ion-content>

    <!-- Edit Profile Modal -->
    <ion-modal :is-open="isEditing" @didDismiss="isEditing = false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Өңдеу</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="isEditing = false">Жабу</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list>
          <ion-item>
            <ion-input label="Аты-жөні" label-placement="floating" v-model="editForm.name"></ion-input>
          </ion-item>
          <div class="ion-padding-top ion-padding-bottom" style="color:var(--ion-color-medium);font-size:0.9em;margin-left:16px;">
            Мүмкіндік шектеулері:
          </div>
          <ion-item>
            <ion-toggle v-model="editForm.isDeaf">Есту қабілеті шектеулі</ion-toggle>
          </ion-item>
          <ion-item>
            <ion-toggle v-model="editForm.isBlind">Көру қабілеті шектеулі</ion-toggle>
          </ion-item>
          <ion-item>
            <ion-textarea 
              label="Жеке дауыс ережелері (AI)" 
              label-placement="floating" 
              v-model="editForm.customPrompt" 
              placeholder="Мысалы: 'Зорайт' десем мәтінді үлкейт..."
              rows="3"
            ></ion-textarea>
          </ion-item>
        </ion-list>
        
        <ion-button expand="block" class="ion-margin-top" @click="saveProfile" :disabled="isSaving">
          {{ isSaving ? 'Сақталуда...' : 'Сақтау' }}
        </ion-button>
      </ion-content>
    </ion-modal>

  </ion-page>
</template>

<script setup lang="ts">
import { reactive, inject, type Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton,
  IonContent, IonList, IonListHeader, IonItem, IonLabel, IonToggle, IonSelect,
  IonSelectOption, IonIcon, IonText, IonAvatar, IonChip, IonBadge, IonNote,
  IonModal, IonInput, IonTextarea, onIonViewWillEnter, onIonViewDidLeave, toastController
} from '@ionic/vue';

const router = useRouter();

const isDark = inject<Ref<boolean>>('isDark')!;
const toggleTheme = inject<() => void>('toggleTheme')!;

const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=ComixUser`;

// Profile State
const user = reactive({
  name: 'Жүктелуде...',
  email: '',
  role: '',
  isDeaf: false,
  isBlind: false,
  customPrompt: ''
});

// Edit Modal State
const isEditing = ref(false);
const isSaving = ref(false);
const editForm = reactive({
  name: '',
  isDeaf: false,
  isBlind: false,
  customPrompt: ''
});

const settings = inject<{
  audioEnabled: boolean;
  largeText: boolean;
  highContrast: boolean;
  haptic: boolean;
  audioSpeed: string;
}>('a11ySettings')!;

async function loadProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Fetch failed');
    
    const data = await res.json();
    user.name = data.user.name;
    user.email = data.user.email;
    user.role = data.user.role;
    user.isDeaf = data.user.is_deaf;
    user.isBlind = data.user.is_blind;
    user.customPrompt = data.user.custom_prompt || '';
    
    // Map settings
    let shouldSaveLocal = false;
    if (data.user.audio_enabled !== undefined) {
      settings.audioEnabled = data.user.audio_enabled;
      settings.largeText = data.user.needs_large_text;
      settings.highContrast = data.user.high_contrast;
      settings.haptic = data.user.haptic_enabled;
      settings.audioSpeed = data.user.audio_speed;
      
      if ((data.user.theme === 'dark') !== isDark.value) {
        toggleTheme();
      }
    }
  } catch (err) {
    console.error('Failed to load profile', err);
  }
}

onIonViewWillEnter(() => {
  loadProfile();
  window.addEventListener('profile-updated', loadProfile);
});

onIonViewDidLeave(() => {
  window.removeEventListener('profile-updated', loadProfile);
});

function openEditModal() {
  editForm.name = user.name;
  editForm.isDeaf = user.isDeaf;
  editForm.isBlind = user.isBlind;
  editForm.customPrompt = user.customPrompt;
  isEditing.value = true;
}

async function saveProfile() {
  if (!editForm.name.trim()) return;
  isSaving.value = true;
  
  try {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: editForm.name,
        isDeaf: editForm.isDeaf,
        isBlind: editForm.isBlind,
        customPrompt: editForm.customPrompt,
        theme: isDark.value ? 'dark' : 'light',
        audioEnabled: settings.audioEnabled,
        largeText: settings.largeText,
        highContrast: settings.highContrast,
        hapticEnabled: settings.haptic,
        audioSpeed: settings.audioSpeed
      })
    });
    
    if (!res.ok) throw new Error('Save error');
    
    const data = await res.json();
    user.name = data.user.name;
    user.isDeaf = data.user.is_deaf;
    user.isBlind = data.user.is_blind;
    user.customPrompt = data.user.custom_prompt || '';
    
    isEditing.value = false;
    
    const toast = await toastController.create({
      message: 'Деректер сәтті жаңартылды!',
      duration: 2500,
      color: 'success'
    });
    await toast.present();
    
  } catch (err) {
    console.error(err);
    const toast = await toastController.create({
      message: 'Сақтау кезінде қате кетті',
      duration: 2500,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isSaving.value = false;
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  router.push('/login');
}

let saveTimeout: any = null;
async function saveA11ySettings() {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
      await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user.name,
          isDeaf: user.isDeaf,
          isBlind: user.isBlind,
          customPrompt: user.customPrompt,
          theme: isDark.value ? 'dark' : 'light',
          audioEnabled: settings.audioEnabled,
          largeText: settings.largeText,
          highContrast: settings.highContrast,
          hapticEnabled: settings.haptic,
          audioSpeed: settings.audioSpeed
        })
      });
    } catch (e) {
      console.error('Failed to background save A11y settings', e);
    }
  }, 500); // debounce API calls
}
</script>
