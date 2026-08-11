<template>
  <div class="voice-navigator-container">
    <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="voice-fab">
      <ion-fab-button 
        @click="toggleListening" 
        :color="isListening ? 'danger' : 'primary'"
        aria-label="Дауыспен басқару"
      >
        <ion-icon :icon="isListening ? micOff : mic"></ion-icon>
      </ion-fab-button>
    </ion-fab>

    <!-- Fallback Modal for manual text input if no voice is available -->
    <ion-modal :is-open="isModalOpen" @didDismiss="setModalOpen(false)">
      <ion-header>
        <ion-toolbar>
          <ion-title>Қайда барғыңыз келеді?</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="setModalOpen(false)">Жабу</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input v-model="manualText" placeholder="Мысалы: Комикстерге бар" @keyup.enter="submitManualText"></ion-input>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" @click="submitManualText" :disabled="isLoading">
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>Жіберу</span>
        </ion-button>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonFab, IonFabButton, IonIcon, IonModal, 
  IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonItem, IonInput, IonSpinner 
} from '@ionic/vue';
import { mic, micOff } from 'ionicons/icons';

const router = useRouter();
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

const isListening = ref(false);
const isModalOpen = ref(false);
const manualText = ref('');
const isLoading = ref(false);
const a11ySettings = inject<any>('a11ySettings');

let recognition: any = null;

onMounted(() => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    // Use the browser default language, fallback to ru-RU if undefined, as kk-KZ isn't supported uniformly
    recognition.lang = navigator.language || 'ru-RU';
    
    // If it still fails async due to language, we'll try to re-init or just let it use default
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening.value = true;
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      await processCommand(text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      isListening.value = false;
    };

    recognition.onend = () => {
      isListening.value = false;
    };
  }
});

function toggleListening() {
  if (isListening.value) {
    recognition?.stop();
    isListening.value = false;
  } else {
    if (recognition) {
      try {
        isListening.value = true; // Eager set to prevent double clicks
        playSoundBeep();
        recognition.start();
      } catch (e) {
        console.warn('Speech recognition is already started or failed', e);
      }
    } else {
      isModalOpen.value = true;
    }
  }
}

function setModalOpen(val: boolean) {
  isModalOpen.value = val;
}

async function submitManualText() {
  if (!manualText.value.trim()) return;
  isLoading.value = true;
  await processCommand(manualText.value);
  isLoading.value = false;
  isModalOpen.value = false;
  manualText.value = '';
}

function playSoundBeep() {
  // Beep to indicate navigation sound/acceptance as requested by user
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime); // 440 Hz (A4)
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start();
  
  gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
  osc.stop(ctx.currentTime + 0.5);
}

function speakFeedback(text: string) {
  if (a11ySettings?.audioEnabled === false) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'kk-KZ';
  utterance.rate = parseFloat(a11ySettings?.audioSpeed || '1');
  
  if (a11ySettings?.audioEnabled) {
    window.speechSynthesis.speak(utterance);
  }
}

async function processCommand(text: string) {
  try {
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${apiBase}/ai/navigate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Dispatch action if present
      if (data.action) {
        (document.activeElement as HTMLElement)?.blur();
        playSoundBeep();
        window.dispatchEvent(new CustomEvent('ai-action', { detail: data.action }));
        speakFeedback(data.message);
      } else if (data.route) {
        (document.activeElement as HTMLElement)?.blur();
        playSoundBeep(); // Beep upon successful path
        router.push(data.route);
        setTimeout(() => speakFeedback(data.message), 600);
      } else {
        speakFeedback(data.message);
      }
    } else {
      speakFeedback('Сервер қатесі орын алды.');
    }
  } catch (error) {
    console.error(error);
    speakFeedback('Желі қатесі.');
  }
}
</script>

<style scoped>
.voice-fab {
  margin-bottom: 20px;
  margin-right: 20px;
  z-index: 9999;
}
</style>
