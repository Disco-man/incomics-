<template>
  <ion-app :class="{
    'ion-palette-dark': isDark,
    'accessible-large-text': settings.largeText,
    'accessible-high-contrast': settings.highContrast
  }">
    <ion-router-outlet />
    <VoiceNavigator />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { ref, reactive, provide, onMounted, watch } from 'vue';
import VoiceNavigator from './components/VoiceNavigator.vue';

const isDark = ref(true);

const settings = reactive({
  audioEnabled: true,
  largeText: false,
  highContrast: false,
  haptic: true,
  audioSpeed: '1',
});

function toggleTheme() {
  isDark.value = !isDark.value;
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}

onMounted(() => {
  window.addEventListener('ai-action', handleGlobalAiAction);
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isDark.value = false;
  }
  const savedSettings = localStorage.getItem('a11ySettings');
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings));
  }
});

watch(settings, (newSettings) => {
  localStorage.setItem('a11ySettings', JSON.stringify(newSettings));
});

async function patchProfile(updates: any) {
  const token = localStorage.getItem('token');
  if (!token) return;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
  
  try {
    const res = await fetch(`${apiUrl}/auth/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return;
    const data = await res.json();
    const user = data.user;
    
    await fetch(`${apiUrl}/auth/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        isDeaf: updates.isDeaf !== undefined ? updates.isDeaf : user.is_deaf,
        isBlind: updates.isBlind !== undefined ? updates.isBlind : user.is_blind,
        customPrompt: user.custom_prompt,
        theme: isDark.value ? 'dark' : 'light',
        audioEnabled: settings.audioEnabled,
        largeText: settings.largeText,
        highContrast: settings.highContrast,
        hapticEnabled: settings.haptic,
        audioSpeed: settings.audioSpeed
      })
    });
    
    // Notify ProfilePage to refresh its UI if it's open
    window.dispatchEvent(new Event('profile-updated'));
  } catch (e) {
    console.error('Failed to update profile globally', e);
  }
}

function handleGlobalAiAction(event: any) {
  const action = String(event.detail || '').trim().toUpperCase();
  switch (action) {
    case 'SET_THEME_DARK': 
      if (!isDark.value) toggleTheme();
      patchProfile({});
      break;
    case 'SET_THEME_LIGHT': 
      if (isDark.value) toggleTheme();
      patchProfile({});
      break;
    case 'TOGGLE_LARGE_TEXT':
      settings.largeText = !settings.largeText;
      patchProfile({});
      break;
    case 'TOGGLE_CONTRAST':
      settings.highContrast = !settings.highContrast;
      patchProfile({});
      break;
    case 'TOGGLE_AUDIO':
      settings.audioEnabled = !settings.audioEnabled;
      patchProfile({});
      break;
    case 'PROFILE_SET_DEAF':
      patchProfile({ isDeaf: true });
      break;
    case 'PROFILE_REMOVE_DEAF':
      patchProfile({ isDeaf: false });
      break;
    case 'PROFILE_SET_BLIND':
      patchProfile({ isBlind: true });
      break;
    case 'PROFILE_REMOVE_BLIND':
      patchProfile({ isBlind: false });
      break;
  }
}

// Provide to child components
provide('isDark', isDark);
provide('toggleTheme', toggleTheme);
provide('a11ySettings', settings);
</script>
