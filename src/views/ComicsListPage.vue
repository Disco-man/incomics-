<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Комикстер</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Комикс іздеу..."
          aria-label="Комикс іздеу"
          :animated="true"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content>

      <!-- Category chips -->
      <div class="ion-padding-horizontal ion-padding-top">
        <ion-chip
          v-for="cat in categories"
          :key="cat.id"
          :color="selectedCategory === cat.id ? 'primary' : 'medium'"
          @click="selectedCategory = cat.id"
          :aria-label="cat.label + ' санаты'"
          :aria-pressed="selectedCategory === cat.id"
        >
          <ion-icon :name="cat.icon" />
          <ion-label>{{ cat.label }}</ion-label>
        </ion-chip>
      </div>

      <!-- Comics list -->
      <ion-list v-if="filteredComics.length">
        <ion-list-header>
          <ion-label>{{ filteredComics.length }} комикс табылды</ion-label>
        </ion-list-header>

        <ion-card
          v-for="comic in filteredComics"
          :key="comic.id"
          button
          :router-link="`/comic/${comic.id}`"
          :aria-label="`${comic.title} комиксін оқу`"
        >
          <img
            :src="comic.coverImage"
            :alt="comic.title + ' мұқабасы'"
            style="width:100%;max-height:200px;object-fit:cover;"
          />
          <ion-card-header>
            <ion-card-title>{{ comic.title }}</ion-card-title>
            <ion-card-subtitle style="display:flex; align-items:center; gap:4px">
              <ion-icon name="book-outline" /> {{ comic.totalPages }} бет · 
              <ion-icon name="language-outline" /> {{ comic.language }}
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-text>
              <p style="display:flex; align-items:flex-start; gap:8px">
                <ion-icon name="information-circle-outline" color="primary" style="margin-top:2px; flex-shrink:0" />
                {{ comic.description }}
              </p>
            </ion-text>

            <!-- Accessibility features -->
            <div class="ion-padding-top">
              <ion-chip
                v-if="comic.hasAudio"
                color="success"
                aria-label="Аудио озвучка бар"
              >
                <ion-icon name="volume-high-outline" />
                <ion-label>Аудио</ion-label>
              </ion-chip>
              <ion-chip
                v-if="comic.hasDescription"
                color="secondary"
                aria-label="Сурет сипаттамасы бар"
              >
                <ion-icon name="text-outline" />
                <ion-label>Сипаттама</ion-label>
              </ion-chip>
              <ion-chip
                color="primary"
                :aria-label="comic.language + ' тілінде'"
              >
                <ion-icon name="language-outline" />
                <ion-label>{{ comic.language }}</ion-label>
              </ion-chip>
            </div>

            <!-- Progress -->
            <ion-item lines="none" class="ion-no-padding ion-margin-top">
              <ion-icon slot="start" name="book-outline" color="primary" />
              <ion-label>Прогресс</ion-label>
              <ion-note slot="end">{{ comic.progress }}%</ion-note>
            </ion-item>
            <ion-progress-bar
              :value="comic.progress / 100"
              color="primary"
              :aria-label="`Оқу прогресі: ${comic.progress}%`"
            />
          </ion-card-content>
        </ion-card>
      </ion-list>

      <!-- Empty state -->
      <div v-else class="ion-text-center ion-padding">
        <ion-icon
          name="search-outline"
          color="medium"
          style="font-size:48px;"
          aria-hidden="true"
        />
        <ion-text color="medium">
          <h3>Комикс табылмады</h3>
          <p>Іздеу сөзін өзгертіп көріңіз</p>
        </ion-text>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonList, IonListHeader, IonItem, IonLabel,
  IonText, IonIcon, IonChip, IonProgressBar, IonNote
} from '@ionic/vue';

interface Comic {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  totalPages: number;
  language: string;
  hasAudio: boolean;
  hasDescription: boolean;
  progress: number;
  category: string;
}

const searchQuery = ref('');
const selectedCategory = ref('all');

const categories = [
  { id: 'all', label: 'Барлығы', icon: 'grid-outline' },
  { id: 'accessible', label: 'Қолжетімді', icon: 'accessibility-outline' },
  { id: 'new', label: 'Жаңа', icon: 'sparkles-outline' },
  { id: 'popular', label: 'Танымал', icon: 'trending-up-outline' },
];

const comics = ref<Comic[]>([]);
const isLoading = ref(true);

import { onIonViewWillEnter } from '@ionic/vue';

onIonViewWillEnter(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/comics`);
    const data = await res.json();
    const baseUrl = apiUrl.replace('/api', '');
    const resolveMedia = (path: string | null) => {
      if (!path) return '';
      if (path.startsWith('/uploads')) return baseUrl + path;
      return path.startsWith('/') ? path : `/${path}`;
    };

    comics.value = (data.comics || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description || '',
      coverImage: resolveMedia(c.cover_image),
      totalPages: c.total_pages,
      language: c.language === 'kk' ? 'Қазақша' : 'Орысша',
      hasAudio: true,
      hasDescription: true,
      progress: 0,
      category: 'accessible'
    }));
  } catch (e) {
    console.error('Fetch library error', e);
  } finally {
    isLoading.value = false;
  }
});

const filteredComics = computed(() => {
  let result = comics.value;
  if (selectedCategory.value !== 'all') {
    result = result.filter(c => c.category === selectedCategory.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }
  return result;
});
</script>
