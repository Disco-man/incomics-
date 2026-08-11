<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>INCOMICS</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Features row -->
      <ion-list-header>
        <ion-label>Платформа мүмкіндіктері</ion-label>
      </ion-list-header>

      <ion-list inset>
        <ion-item>
          <ion-icon slot="start" name="volume-high-outline" color="primary" />
          <ion-label>
            <h3>Аудио озвучка</h3>
            <p>Саңырау немесе есту қабілеті нашар оқырмандарға арналған</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="eye-off-outline" color="secondary" />
          <ion-label>
            <h3>Screen Reader қолдауы</h3>
            <p>Зағип оқырмандарға арналған толық сипаттамалар</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="speedometer-outline" color="tertiary" />
          <ion-label>
            <h3>Реттелетін жылдамдық</h3>
            <p>0.75x — 1.5x аудио жылдамдығы</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list-header>
        <ion-label>Кітапхана (Жаңа Комикстер)</ion-label>
      </ion-list-header>

      <div v-if="isLoading" class="ion-text-center ion-padding">Жүктелуде...</div>

      <template v-else>
        <!-- Featured Banner for the first newest comic -->
        <ion-card v-if="comics.length > 0" button :router-link="`/comic/${comics[0].id}`" aria-label="Жаңа комиксін оқу">
          <img
            :src="comics[0].cover_image"
            alt="Комикс мұқабасы"
            style="width:100%;object-fit:cover;max-height:220px;"
          />
          <ion-card-header>
            <ion-chip color="danger" aria-label="Жаңа комикс">
              <ion-icon name="star-outline" />
              <ion-label>Жаңа</ion-label>
            </ion-chip>
            <ion-card-title>{{ comics[0].title }}</ion-card-title>
            <ion-card-subtitle style="display:flex; align-items:center; gap:4px">
              <ion-icon name="star" color="warning" /> Барлық мүмкіндіктер бар · 
              <ion-icon name="book-outline" /> {{ comics[0].total_pages }} бет · 
              <ion-icon name="language-outline" /> {{ comics[0].language === 'kk' ? 'Қазақша' : 'Орысша' }}
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-text>
              <p style="display:flex; align-items:flex-start; gap:8px">
                <ion-icon name="information-circle-outline" color="primary" style="margin-top:2px; flex-shrink:0" />
                <span>{{ comics[0].description }}</span>
              </p>
            </ion-text>
            <ion-button expand="block" class="ion-margin-top" :router-link="`/comic/${comics[0].id}`">
              <ion-icon slot="start" name="book-outline" />
              Оқуды бастау
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Other comics list -->
        <ion-card v-for="comic in comics.slice(1)" :key="comic.id" button :router-link="`/comic/${comic.id}`">
          <ion-item lines="none">
            <ion-thumbnail slot="start" v-if="comic.cover_image">
              <img :src="comic.cover_image" style="object-fit: cover;" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ comic.title }}</h2>
              <p>{{ comic.total_pages }} бет · Барлық мүмкіндіктер бар</p>
            </ion-label>
          </ion-item>
        </ion-card>

        <ion-card color="light" v-if="comics.length === 0">
          <ion-item lines="none">
            <ion-icon slot="start" name="time-outline" color="medium" />
            <ion-label class="ion-text-wrap">
              <p>Жақын арада жаңа комикстер қосылады.</p>
            </ion-label>
          </ion-item>
        </ion-card>
      </template>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonText, IonList, IonListHeader, IonItem, IonLabel,
  IonThumbnail, IonBadge, IonChip, IonButton, IonIcon, onIonViewWillEnter
} from '@ionic/vue';

const comics = ref<any[]>([]);
const isLoading = ref(true);

onIonViewWillEnter(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/comics`);
    const data = await res.json();
    const baseUrl = apiUrl.replace('/api', '');
    comics.value = (data.comics || []).map((c: any) => {
      let cover = c.cover_image;
      if (cover) {
        if (cover.startsWith('/uploads')) cover = baseUrl + cover;
        else if (!cover.startsWith('/')) cover = '/' + cover;
      }
      return { ...c, cover_image: cover };
    });
  } catch(e) {
    console.error('Fetch homepage comics failed', e);
  } finally {
    isLoading.value = false;
  }
});
</script>
