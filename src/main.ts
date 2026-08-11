import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import { addIcons } from 'ionicons';
import {
  homeOutline, libraryOutline, personOutline, logOutOutline, checkmarkCircleOutline, 
  accessibilityOutline, moonOutline, sunnyOutline, volumeHighOutline, volumeMuteOutline, 
  textOutline, contrastOutline, handLeftOutline, speedometerOutline, earOutline, 
  eyeOutline, eyeOffOutline, barChartOutline, bookOutline, timeOutline, bookmarkOutline, 
  bookmark, atOutline, mailOutline, callOutline, lockClosedOutline, shieldCheckmarkOutline, 
  logInOutline, personAddOutline, languageOutline, informationCircleOutline, searchOutline, 
  gridOutline, sparklesOutline, trendingUpOutline, starOutline, star, chevronBackOutline, 
  chevronForwardOutline, shareOutline, documentTextOutline, printOutline, appsOutline,
  imagesOutline, closeOutline, createOutline, settingsOutline, addCircleOutline,
  addOutline, saveOutline
} from 'ionicons/icons';

addIcons({
  'home-outline': homeOutline,
  'library-outline': libraryOutline,
  'person-outline': personOutline,
  'log-out-outline': logOutOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'accessibility-outline': accessibilityOutline,
  'moon-outline': moonOutline,
  'sunny-outline': sunnyOutline,
  'volume-high-outline': volumeHighOutline,
  'volume-mute-outline': volumeMuteOutline,
  'text-outline': textOutline,
  'contrast-outline': contrastOutline,
  'hand-left-outline': handLeftOutline,
  'speedometer-outline': speedometerOutline,
  'ear-outline': earOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'bar-chart-outline': barChartOutline,
  'book-outline': bookOutline,
  'time-outline': timeOutline,
  'bookmark-outline': bookmarkOutline,
  'bookmark': bookmark,
  'at-outline': atOutline,
  'mail-outline': mailOutline,
  'call-outline': callOutline,
  'lock-closed-outline': lockClosedOutline,
  'shield-checkmark-outline': shieldCheckmarkOutline,
  'log-in-outline': logInOutline,
  'person-add-outline': personAddOutline,
  'language-outline': languageOutline,
  'information-circle-outline': informationCircleOutline,
  'search-outline': searchOutline,
  'grid-outline': gridOutline,
  'sparkles-outline': sparklesOutline,
  'trending-up-outline': trendingUpOutline,
  'star-outline': starOutline,
  'star': star,
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'share-outline': shareOutline,
  'document-text-outline': documentTextOutline,
  'print-outline': printOutline,
  'apps-outline': appsOutline,
  'images-outline': imagesOutline,
  'close-outline': closeOutline,
  'create-outline': createOutline,
  'settings-outline': settingsOutline,
  'add-circle-outline': addCircleOutline,
  'add-outline': addOutline,
  'save-outline': saveOutline
});

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
import '@ionic/vue/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue, {
    mode: 'md',           // Material Design mode — compact-қа жақсы келеді
    animated: true,
  })
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});
