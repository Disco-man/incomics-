<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home" aria-label="Басты бет">
          <ion-icon name="home-outline" />
          <ion-label>Басты бет</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="comics" href="/tabs/comics" aria-label="Комикстер тізімі">
          <ion-icon name="library-outline" />
          <ion-label>Комикстер</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/tabs/profile" aria-label="Профиль">
          <ion-icon name="person-outline" />
          <ion-label>Профиль</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton,
  IonIcon, IonLabel
} from '@ionic/vue';
</script>
