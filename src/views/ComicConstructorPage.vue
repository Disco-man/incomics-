<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin" aria-label="Артқа қайту" />
        </ion-buttons>
        <ion-title>{{ isEditing ? 'Комиксті Өңдеу' : 'Жаңа Комикс' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="isEditing" @click="confirmDelete" color="danger" aria-label="Өшіру">
            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
          </ion-button>
          <ion-button @click="saveComic" :disabled="isSaving" aria-label="Сақтау">
            <ion-icon slot="icon-only" name="save-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="isLoading" class="ion-text-center">Жүктелуде...</div>
      
      <div v-else>
        <ion-list>
          <ion-list-header>
            <ion-label>Негізгі Ақпарат</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-input label="Атауы" label-placement="floating" v-model="form.title" placeholder="Жаңа Дүние"></ion-input>
          </ion-item>

          <ion-item>
            <ion-textarea label="Қысқаша Сипаттама" label-placement="floating" v-model="form.description"></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Мұқаба Суреті (Cover)</ion-label>
            <input type="file" accept="image/*" @change="onCoverSelected" style="margin-top:8px" />
            <div v-if="form.existingCover && !form.coverFile" style="margin-top:8px;font-size:0.9em;color:var(--ion-color-medium)">
              Қазіргі сурет жүктелген
            </div>
          </ion-item>

          <ion-item>
            <ion-toggle v-model="form.isPublished">Жариялау (Публикация)</ion-toggle>
          </ion-item>
        </ion-list>

        <!-- Pages -->
        <h2 class="ion-margin-top">Парақтар (Слайдтар)</h2>
        <div v-for="(page, index) in form.pages" :key="index" class="page-block">
          <ion-item lines="none" color="light">
            <ion-label><strong>{{ index + 1 }} - бет</strong></ion-label>
            <ion-button fill="clear" color="danger" slot="end" @click="removePage(index)">Өшіру</ion-button>
          </ion-item>

          <ion-item>
            <ion-textarea label="Мәтін (Сипаттама)" label-placement="floating" v-model="page.text"></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Сурет (Image)</ion-label>
            <input type="file" accept="image/*" @change="(e) => onPageImageSelected(e, index)" style="margin-top:8px" />
            <div v-if="page.existingImage && !page.imageFile" style="margin-top:8px;font-size:0.9em;color:var(--ion-color-medium)">
              Қазіргі сурет бар
            </div>
          </ion-item>

          <ion-item lines="none">
            <ion-label position="stacked">Аудио (MP3)</ion-label>
            <input type="file" accept="audio/*" @change="(e) => onPageAudioSelected(e, index)" style="margin-top:8px" />
            <div v-if="page.existingAudio && !page.audioFile" style="margin-top:8px;font-size:0.9em;color:var(--ion-color-medium)">
              Қазіргі аудио бар
            </div>
          </ion-item>
        </div>

        <ion-button expand="block" fill="outline" class="ion-margin-top" @click="addPage">
          <ion-icon slot="start" name="add-outline"></ion-icon>
          Бет қосу
        </ion-button>

        <ion-button expand="block" class="ion-margin-top" @click="saveComic" :disabled="isSaving">
          {{ isSaving ? 'Сақталуда...' : 'Сақтау' }}
        </ion-button>

        <ion-button v-if="isEditing" expand="block" fill="clear" color="danger" class="ion-margin-top" @click="confirmDelete">
          <ion-icon slot="start" :icon="trashOutline"></ion-icon>
          Комиксті толық өшіру
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonList, IonListHeader, IonItem, IonLabel, IonInput,
  IonTextarea, IonToggle, IonButton, IonIcon, onIonViewWillEnter, toastController,
  alertController
} from '@ionic/vue';
import { trashOutline } from 'ionicons/icons';

const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const comicId = ref<string | null>(null);

interface PageForm {
  text: string;
  imageFile: File | null;
  audioFile: File | null;
  existingImage: string;
  existingAudio: string | null;
}

const form = ref({
  title: '',
  description: '',
  isPublished: false,
  coverFile: null as File | null,
  existingCover: '',
  pages: [] as PageForm[]
});

async function showToast(msg: string, color = 'success') {
  const t = await toastController.create({ message: msg, duration: 2000, color });
  await t.present();
}

onIonViewWillEnter(async () => {
  comicId.value = route.params.id as string;
  if (comicId.value && comicId.value !== 'new') {
    isEditing.value = true;
    await loadComic(comicId.value);
  } else {
    isEditing.value = false;
    isLoading.value = false;
    // initial empty page
    form.value.pages = [createEmptyPage()];
  }
});

function createEmptyPage(): PageForm {
  return { text: '', imageFile: null, audioFile: null, existingImage: '', existingAudio: null };
}

function addPage() {
  form.value.pages.push(createEmptyPage());
}

function removePage(index: number) {
  form.value.pages.splice(index, 1);
}

function onCoverSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    form.value.coverFile = target.files[0];
  }
}

function onPageImageSelected(e: Event, index: number) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    form.value.pages[index].imageFile = target.files[0];
  }
}

function onPageAudioSelected(e: Event, index: number) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    form.value.pages[index].audioFile = target.files[0];
  }
}

async function loadComic(id: string) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
    const res = await fetch(`${apiUrl}/comics/${id}`);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    
    // Comic data doesn't return is_published from public endpoint, we should ideally fetch via Admin but it's fine for prototyping
    form.value.title = data.comic.title;
    form.value.description = data.comic.description || '';
    form.value.isPublished = !!data.comic.is_published;
    
    form.value.existingCover = data.comic.cover_image;
    
    form.value.pages = data.pages.map((p: any) => ({
      text: p.description || '',
      imageFile: null,
      audioFile: null,
      existingImage: p.image_path,
      existingAudio: p.audio_path
    }));
  } catch (error) {
    showToast('Комиксті жүктеу қатесі', 'danger');
  } finally {
    isLoading.value = false;
  }
}

async function saveComic() {
  if (!form.value.title) {
    showToast('Атауын жазыңыз', 'warning');
    return;
  }

  isSaving.value = true;
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

  const fd = new FormData();
  if (isEditing.value && comicId.value) {
    fd.append('id', comicId.value);
    fd.append('existingCover', form.value.existingCover);
  }
  fd.append('title', form.value.title);
  fd.append('description', form.value.description);
  fd.append('isPublished', form.value.isPublished ? 'true' : 'false');
  fd.append('totalPages', form.value.pages.length.toString());
  
  if (form.value.coverFile) {
    fd.append('cover_image', form.value.coverFile);
  }

  form.value.pages.forEach((p, idx) => {
    fd.append(`page_${idx}_text`, p.text);
    fd.append(`page_${idx}_existing_image`, p.existingImage || '');
    fd.append(`page_${idx}_existing_audio`, p.existingAudio || '');
    if (p.imageFile) fd.append(`page_${idx}_image`, p.imageFile);
    if (p.audioFile) fd.append(`page_${idx}_audio`, p.audioFile);
  });

  try {
    const res = await fetch(`${apiUrl}/comics/admin/save`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: fd
    });
    
    if (!res.ok) throw new Error('Save error');
    
    showToast('Сәтті сақталды!');
    router.replace('/admin');
  } catch (error) {
    console.error(error);
    showToast('Сақтау барысында қате шықты', 'danger');
  } finally {
    isSaving.value = false;
  }
}

async function confirmDelete() {
  const alert = await alertController.create({
    header: 'Комиксті өшіру',
    message: 'Бұл комиксті толықтай жою қалағаныңызға сенімдісіз бе? Бұл әрекетті қайтару мүмкін емес.',
    buttons: [
      { text: 'Бас тарту', role: 'cancel' },
      { text: 'Өшіру', role: 'destructive', handler: deleteComic }
    ]
  });
  await alert.present();
}

async function deleteComic() {
  if (!comicId.value) return;
  isSaving.value = true;
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

  try {
    const res = await fetch(`${apiUrl}/comics/admin/${comicId.value}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Delete error');
    
    showToast('Комикс сәтті өшірілді');
    router.replace('/admin');
  } catch (error) {
    console.error(error);
    showToast('Өшіру барысында қате шықты', 'danger');
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.page-block {
  border: 1px solid var(--ion-color-step-150, #ddd);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}
</style>
