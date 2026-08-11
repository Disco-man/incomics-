<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" aria-label="Артқа қайту" />
        </ion-buttons>
        <ion-title>Админ Панелі</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-button expand="block" class="ion-margin-bottom" router-link="/admin/constructor/new">
        <ion-icon slot="start" name="add-circle-outline"></ion-icon>
        Жаңа комикс құру
      </ion-button>

      <h2>Комикстер тізімі</h2>
      <ion-list>
        <ion-item v-for="comic in comics" :key="comic.id" button :router-link="`/admin/constructor/${comic.id}`">
          <ion-thumbnail slot="start" v-if="comic.cover_image">
            <img :src="comic.cover_image" style="object-fit: cover;" />
          </ion-thumbnail>
          <ion-label>
            <h3>{{ comic.title }}</h3>
            <p>{{ comic.total_pages }} бет</p>
          </ion-label>
          <ion-badge slot="end" :color="comic.is_published ? 'success' : 'medium'">
            {{ comic.is_published ? 'Жарияланды' : 'Жарияланбаған' }}
          </ion-badge>
        </ion-item>
      </ion-list>
      <p v-if="comics.length === 0" class="ion-text-center">Әлі комикс жарияланған жоқ.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonBadge, IonThumbnail, IonButtons, IonBackButton
} from '@ionic/vue';
import { onIonViewWillEnter } from '@ionic/vue';

interface Comic {
  id: number;
  title: string;
  cover_image: string;
  total_pages: number;
  is_published: boolean;
}

const comics = ref<Comic[]>([]);

async function loadComics() {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/comics/admin/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch');
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
  } catch (error) {
    console.error('Error fetching admin comics', error);
  }
}

onIonViewWillEnter(() => {
  loadComics();
});
</script>
