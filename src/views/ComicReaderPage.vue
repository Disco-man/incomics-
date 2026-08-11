<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" aria-label="Артқа қайту" />
        </ion-buttons>
        <ion-title>{{ comic.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openExportMenu" aria-label="Экспорт және Баспаға шығару">
            <ion-icon slot="icon-only" :icon="shareOutline" />
          </ion-button>
          <ion-button
            @click="toggleBookmark"
            :aria-label="bookmarked ? 'Бетбелгіні алып тастау' : 'Бетбелгі қою'"
          >
            <ion-icon slot="icon-only" :icon="bookmarked ? bookmark : bookmarkOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>

      <!-- Slide area -->
      <swiper
        v-if="slides.length > 0"
        :slides-per-view="1"
        :space-between="0"
        :centered-slides="true"
        :allow-touch-move="true"
        :keyboard="{ enabled: true }"
        :a11y="{
          enabled: true,
          prevSlideMessage: 'Алдыңғы бет',
          nextSlideMessage: 'Келесі бет',
          paginationBulletMessage: '{{index}}-бет',
        }"
        @swiper="onSwiperInit"
        @slideChange="onSlideChange"
        style="height: 100%;"
      >
        <swiper-slide
          v-for="(slide, index) in slides"
          :key="index"
          :aria-label="`${index + 1} / ${slides.length} бет — ${slide.description}`"
        >
          <ion-card class="ion-no-margin" style="height:100%;border-radius:0;">
            <img
              :src="slide.image"
              :alt="slide.description"
              style="width:100%;height:auto;display:block;max-height:65vh;object-fit:contain;"
            />
            <!-- Description card -->
            <ion-card-content>
              <ion-text>
                <p class="ion-no-margin">{{ slide.description }}</p>
              </ion-text>
            </ion-card-content>
          </ion-card>
        </swiper-slide>
      </swiper>

    </ion-content>

    <!-- Bottom toolbar: controls -->
    <ion-footer>
      <ion-toolbar>

        <!-- Progress -->
        <ion-progress-bar
          :value="progress"
          color="primary"
          aria-label="Комикс оқу прогресі"
          :aria-valuenow="currentIndex + 1"
          :aria-valuemax="slides.length"
        />

        <!-- Navigation -->
        <div>
          <ion-grid>
            <ion-row class="ion-align-items-center">

              <!-- Prev -->
              <ion-col size="2" class="ion-text-center">
                <ion-button
                  fill="clear"
                  :disabled="currentIndex === 0"
                  @click="prevSlide"
                  aria-label="Алдыңғы бет"
                >
                  <ion-icon slot="icon-only" :icon="chevronBackOutline" />
                </ion-button>
              </ion-col>

              <!-- Audio controls -->
              <ion-col size="8">
                <ion-row class="ion-justify-content-center ion-align-items-center">
                  <!-- Play/Pause -->
                  <ion-col size="auto">
                    <ion-button
                      :color="autoPlayActive ? 'warning' : 'primary'"
                      shape="round"
                      size="large"
                      @click="toggleAutoPlay"
                      :aria-label="autoPlayActive ? 'Авто-ойнатуды тоқтату' : 'Авто-ойнатуды бастау'"
                      :aria-pressed="autoPlayActive"
                    >
                      <ion-icon
                        slot="icon-only"
                        :icon="autoPlayActive ? pauseCircleOutline : playCircleOutline"
                      />
                    </ion-button>
                  </ion-col>

                  <!-- Page indicator -->
                  <ion-col size="auto" class="ion-padding-horizontal">
                    <ion-chip color="primary" aria-live="polite" :aria-label="`${currentIndex + 1} / ${slides.length} бет`">
                      <ion-label>{{ currentIndex + 1 }} / {{ slides.length }}</ion-label>
                    </ion-chip>
                  </ion-col>

                  <!-- No audio indicator -->
                  <ion-col size="auto" v-if="!currentSlide.audio">
                    <ion-icon :icon="volumeMuteOutline" color="medium" aria-label="Бұл беттің аудиосы жоқ" />
                  </ion-col>
                </ion-row>
              </ion-col>

              <!-- Next -->
              <ion-col size="2" class="ion-text-center">
                <ion-button
                  fill="clear"
                  :disabled="currentIndex === slides.length - 1"
                  @click="nextSlide"
                  aria-label="Келесі бет"
                >
                  <ion-icon slot="icon-only" :icon="chevronForwardOutline" />
                </ion-button>
              </ion-col>

            </ion-row>
          </ion-grid>
        </div>

      </ion-toolbar>

      <!-- Audio speed + auto-play status -->
      <ion-toolbar>
        <ion-segment v-model="audioSpeed" @ionChange="onSpeedChange" aria-label="Аудио жылдамдығы">
          <ion-segment-button value="0.75" aria-label="Баяу жылдамдық">
            <ion-label>0.75x</ion-label>
          </ion-segment-button>
          <ion-segment-button value="1" aria-label="Қалыпты жылдамдық">
            <ion-label>1x</ion-label>
          </ion-segment-button>
          <ion-segment-button value="1.25" aria-label="Жылдам жылдамдық">
            <ion-label>1.25x</ion-label>
          </ion-segment-button>
          <ion-segment-button value="1.5" aria-label="Өте жылдам жылдамдық">
            <ion-label>1.5x</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-footer>

    <!-- Screen-reader only live region for slide changes -->
    <div
      aria-live="assertive"
      aria-atomic="true"
      class="ion-visually-hidden"
      role="status"
    >
      {{ liveAnnouncement }}
    </div>

    <!-- Hidden Print Area -->
    <div id="print-area" class="print-only">
      <h1>{{ comic.title }}</h1>
      <template v-if="printMode === 'text' || printMode === 'braille'">
        <div v-for="(slide, i) in slides" :key="i" class="print-slide-text">
          <h2 v-if="printMode === 'text'">{{ i + 1 }} - бет</h2>
          <p :class="{'braille-text': printMode === 'braille'}" style="font-size: 24px; line-height: 1.5; margin-bottom: 2rem;">
            {{ printMode === 'braille' ? translateToBraille((i + 1) + ' бет. ' + slide.description) : slide.description }}
          </p>
        </div>
      </template>
      <template v-if="printMode === 'images'">
        <div v-for="(slide, i) in slides" :key="i" class="print-slide-image" style="page-break-after: always; text-align: center;">
          <img :src="slide.image" :alt="slide.description" style="max-width: 100%; max-height: 90vh;" />
        </div>
      </template>
    </div>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonButton, IonContent, IonFooter, IonIcon, IonGrid, IonRow, IonCol,
  IonChip, IonLabel, IonProgressBar, IonText, IonCard, IonCardContent,
  IonSegment, IonSegmentButton, actionSheetController
} from '@ionic/vue';
import {
  shareOutline, bookmark, bookmarkOutline, chevronBackOutline,
  chevronForwardOutline, playCircleOutline, pauseCircleOutline,
  volumeMuteOutline
} from 'ionicons/icons';
import { translateToBraille } from '../utils/braille';

// ── Print State ──────────────────────────────────────────────────────────────
const printMode = ref<'none' | 'text' | 'braille' | 'images'>('none');


import { useRoute } from 'vue-router';
import { onIonViewWillEnter, onIonViewDidLeave } from '@ionic/vue';

// ── Comic data ──────────────────────────────────────────────────────────────
interface Slide {
  image: string;
  audio: string | null;
  description: string;
}

const route = useRoute();
const slides = ref<Slide[]>([]);
const comic = ref({ title: 'Жүктелуде...' });

onIonViewWillEnter(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/comics/${route.params.id}`);
    if (!res.ok) throw new Error('Failed to load comic');
    const data = await res.json();
    
    comic.value.title = data.comic.title;
    
    const baseUrl = apiUrl.replace('/api', '');
    const resolveMedia = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('/uploads')) return baseUrl + path;
      return path.startsWith('/') ? path : `/${path}`;
    };

    slides.value = (data.pages || []).map((p: any) => ({
      image: resolveMedia(p.image_path) || '',
      audio: resolveMedia(p.audio_path),
      description: p.description || ''
    }));
  } catch (error) {
    console.error(error);
    comic.value.title = 'Қате шықты';
  }
});

// ── State ────────────────────────────────────────────────────────────────────
const swiperInstance = ref<SwiperType | null>(null);
const currentIndex = ref(0);
const isPlaying = ref(false);
const autoPlayActive = ref(false);
const bookmarked = ref(false);
const audioSpeed = ref('1');
const liveAnnouncement = ref('');

function handleAiAction(event: any) {
  const action = String(event.detail || '').trim().toUpperCase();
  switch (action) {
    case 'NEXT_PAGE': nextSlide(); break;
    case 'PREV_PAGE': prevSlide(); break;
    case 'TOGGLE_PLAY': toggleAutoPlay(); break;
    case 'TOGGLE_BOOKMARK': toggleBookmark(); break;
    case 'OPEN_EXPORT': openExportMenu(); break;
    case 'SET_SPEED_0.75': audioSpeed.value = '0.75'; onSpeedChange(); break;
    case 'SET_SPEED_1': audioSpeed.value = '1'; onSpeedChange(); break;
    case 'SET_SPEED_1.25': audioSpeed.value = '1.25'; onSpeedChange(); break;
    case 'SET_SPEED_1.5': audioSpeed.value = '1.5'; onSpeedChange(); break;
  }
}

onIonViewWillEnter(() => {
  window.addEventListener('ai-action', handleAiAction);
});

const NO_AUDIO_DELAY = 3000; // ms to wait on slides without audio

let audioEl: HTMLAudioElement | null = null;
let noAudioTimer: ReturnType<typeof setTimeout> | null = null;

// ── Computed ─────────────────────────────────────────────────────────────────
const currentSlide = computed(() => slides.value[currentIndex.value] || { image: '', audio: null, description: '' });
const progress = computed(() => (currentIndex.value) / (Math.max(1, slides.value.length - 1)));

// ── Methods ───────────────────────────────────────────────────────────────────
function onSwiperInit(swiper: SwiperType) {
  swiperInstance.value = swiper;
}

function onSlideChange() {
  stopAudio();
  clearNoAudioTimer();
  currentIndex.value = swiperInstance.value?.activeIndex ?? 0;
  liveAnnouncement.value = `${currentIndex.value + 1} / ${slides.value.length} бет. ${currentSlide.value.description}`;

  // Auto-play mode: play audio for new slide
  if (autoPlayActive.value) {
    playCurrentSlideAudio();
  }
}

function prevSlide() {
  swiperInstance.value?.slidePrev();
}

function nextSlide() {
  swiperInstance.value?.slideNext();
}

function stopAudio() {
  if (audioEl) {
    audioEl.pause();
    audioEl.currentTime = 0;
    audioEl.removeEventListener('ended', onAudioEnded);
    isPlaying.value = false;
  }
}

function clearNoAudioTimer() {
  if (noAudioTimer) {
    clearTimeout(noAudioTimer);
    noAudioTimer = null;
  }
}

function playCurrentSlideAudio() {
  const slide = currentSlide.value;

  if (!slide.audio) {
    // No audio for this slide — auto-advance after delay
    if (autoPlayActive.value && currentIndex.value < slides.value.length - 1) {
      noAudioTimer = setTimeout(() => {
        nextSlide();
      }, NO_AUDIO_DELAY);
    } else if (currentIndex.value >= slides.value.length - 1) {
      // Last slide with no audio — stop auto-play
      autoPlayActive.value = false;
      liveAnnouncement.value = 'Комикс аяқталды';
    }
    return;
  }

  // Create audio and play
  audioEl = new Audio(slide.audio);
  audioEl.playbackRate = parseFloat(audioSpeed.value);
  audioEl.addEventListener('ended', onAudioEnded);
  audioEl.play().catch(() => {
    // Auto-play blocked by browser — stop auto-play mode
    autoPlayActive.value = false;
    isPlaying.value = false;
  });
  isPlaying.value = true;
}

function onAudioEnded() {
  isPlaying.value = false;

  if (autoPlayActive.value) {
    if (currentIndex.value < slides.value.length - 1) {
      // Auto-advance to next slide
      nextSlide();
    } else {
      // Comic finished
      autoPlayActive.value = false;
      liveAnnouncement.value = 'Комикс аяқталды';
    }
  }
}

function toggleAutoPlay() {
  if (autoPlayActive.value) {
    // Stop auto-play
    autoPlayActive.value = false;
    stopAudio();
    clearNoAudioTimer();
    liveAnnouncement.value = 'Авто-ойнату тоқтатылды';
  } else {
    // Start auto-play (gesture-initiated)
    autoPlayActive.value = true;
    liveAnnouncement.value = 'Авто-ойнату басталды';
    playCurrentSlideAudio();
  }
}

function onSpeedChange() {
  if (audioEl) {
    audioEl.playbackRate = parseFloat(audioSpeed.value);
  }
}

function toggleBookmark() {
  bookmarked.value = !bookmarked.value;
}

// ── Export and Print ────────────────────────────────────────────────────────
async function openExportMenu() {
  const actionSheet = await actionSheetController.create({
    header: 'Экспорт және Баспа',
    buttons: [
      {
        text: 'MD файл құру (Жүктеу)',
        icon: 'document-text-outline',
        handler: () => downloadMarkdown(),
      },
      {
        text: 'Тек мәтінді баспадан шығару',
        icon: 'print-outline',
        handler: () => triggerPrint('text'),
      },
      {
        text: 'Брайль қарпімен баспаға беру',
        icon: 'apps-outline',
        handler: () => triggerPrint('braille'),
      },
      {
        text: 'Суреттерді баспадан шығару',
        icon: 'images-outline',
        handler: () => triggerPrint('images'),
      },
      {
        text: 'Болдырмау',
        role: 'cancel',
        icon: 'close-outline',
      },
    ],
  });
  await actionSheet.present();
}

function downloadMarkdown() {
  let mdContent = `# ${comic.value.title}\n\n`;
  slides.value.forEach((slide: Slide, index: number) => {
    mdContent += `## ${index + 1} - бет\n\n${slide.description}\n\n---\n\n`;
  });
  
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${comic.value.title} - Транскрипция.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function triggerPrint(mode: 'text' | 'braille' | 'images') {
  printMode.value = mode;
  // Wait for Vue to render the print area with new mode before calling print
  setTimeout(() => {
    window.print();
    // After print dialog closes, reset mode so it hides
    setTimeout(() => {
      printMode.value = 'none';
    }, 1000);
  }, 300);
}

onIonViewDidLeave(() => {
  window.removeEventListener('ai-action', handleAiAction);
});

onUnmounted(() => {
  stopAudio();
  clearNoAudioTimer();
});
</script>
