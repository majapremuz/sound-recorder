import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContentObject } from 'src/app/model/content';
import { ControllerService } from 'src/app/services/controller.service';
import { HttpClient } from '@angular/common/http';
import { PushNotifications } from '@capacitor/push-notifications';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { LocationService } from 'src/app/services/location.service';
import { Subscription, firstValueFrom, of, from } from 'rxjs';
import { catchError, defaultIfEmpty } from 'rxjs/operators';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
})
export class HomePage {
  @ViewChild('waveCanvas', { static: false }) waveCanvas!: ElementRef<HTMLCanvasElement>;

  mediaRecorder!: any;
  audioChunks: Blob[] = [];
  isRecording = false;
  timeStamp = '00:00';
  recordingStartTime: number | null = null;
  timerInterval: any;
  autoStopTimeout: any;
  hasSent = false;

  audioPlayer = new Audio();
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volumeLevel = 0;

  authSub?: Subscription;


  @ViewChild('audioCanvas', { static: false }) audioCanvas!: ElementRef<HTMLCanvasElement>;

  audioContext!: AudioContext;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  source!: MediaStreamAudioSourceNode;
  animationId!: number;
  audioUrl: string | null = null;
  recordedBlob!: Blob;
  message = '';
  circleLength = 2 * Math.PI * 45; 
  circleOffset = 0;


  translate: any = [];
  isLoggedIn = false;

  contents: Array<ContentObject> = [];

  constructor(
    private loadingController: LoadingController,
    private dataService: DataService,
    private contrCtrl: ControllerService,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService,
    private locationService: LocationService
  ) {
    this.initTranslate();
  }

ionViewWillEnter() {
  this.authService.syncLoginStateFromStorage();
}

ionViewWillLeave() {
  this.contrCtrl.setHomePage(false);
}

ngOnDestroy() {
  this.authSub?.unsubscribe();
}


  ngOnInit() {
  this.authSub = this.authService.isLoggedIn$().subscribe(state => {
    this.isLoggedIn = state;

    this.initTranslate().catch(err => {
      console.error('initTranslate failed', err);
    });
  });
}

getSupportedMimeType() {
  const types = [
    'audio/mp4',
    'audio/aac',
    'audio/webm',
    'audio/ogg'
  ];

  for (const type of types) {
    if ((window as any).MediaRecorder?.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

getExtension(mimeType: string) {
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'm4a';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'dat';
}

  async startRecording() {
  await Geolocation.requestPermissions();
  if (this.isRecording) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = this.getSupportedMimeType();
    console.log('Using mimeType:', mimeType);

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event: any) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();

    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.animateWave();

    this.timerInterval = setInterval(() => this.updateTimer(), 100);

    this.autoStopTimeout = setTimeout(() => {
      if (this.isRecording) this.stopRecording();
    }, 15000);

  } catch (err) {
    console.error('Recording error:', err);
  }
}

animateWave() {
  const container = this.waveCanvas?.nativeElement || document.querySelector('.img-container');

  const animate = () => {
    if (!this.isRecording) return;

    const volume = Math.random() * 60 + 10; // simulate volume 10-70

    const scale = 1 + volume / 50;
    const speed = 1 - Math.min(volume / 200, 0.7);

    if (container) {
      container.style.setProperty('--wave-scale', scale.toString());
      container.style.setProperty('--wave-speed', speed + 's');
    }

    requestAnimationFrame(animate);
  };

  animate();
}

async stopRecording() {
  if (!this.isRecording) return;

  if (this.autoStopTimeout) {
    clearTimeout(this.autoStopTimeout);
  }

  this.isRecording = false;

  clearInterval(this.timerInterval);
  this.timeStamp = '00:00';

  this.mediaRecorder.onstop = async () => {
    const mimeType = this.mediaRecorder.mimeType;

    this.recordedBlob = new Blob(this.audioChunks, {
      type: mimeType
    });

    console.log('Recorded type:', mimeType);

    this.audioUrl = URL.createObjectURL(this.recordedBlob);

    await this.sendRecording();
  };

  this.mediaRecorder.stop();
}

toggleRecording() {
  if (!this.isLoggedIn) {
    this.router.navigate(['/login']);
    return;
  }
  if (this.isRecording) {
    this.stopRecording();
  } else {
    this.startRecording();
  }
}


async sendRecording() {
  if (!this.recordedBlob) return;

  const loading = await this.loadingController.create({
    spinner: 'crescent',
    backdropDismiss: false
  });
  await loading.present();

  try {
    const ext = this.getExtension(this.recordedBlob.type);
    const fileName = `${Date.now()}.${ext}`;;

    // convert Blob → base64
    let base64Data = await this.blobToBase64(this.recordedBlob);
    if (typeof base64Data === 'string') {
      const commaIndex = base64Data.indexOf(',');
      if (commaIndex !== -1) {
        base64Data = base64Data.substring(commaIndex + 1);
      }
    }

    // request location permission
    const perm = await Geolocation.requestPermissions();
    if (perm.location !== 'granted') {
      console.warn('Location permission denied');
      await loading.dismiss();
      return;
    }

    // get coordinates
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });

    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    // reverse geocode → city, street, country
    const { city: cityName, street, country: countryName } =
      await this.reverseGeocode(coords.latitude, coords.longitude);

    const token = await firstValueFrom(
      from(this.dataService.getAuthToken()).pipe(
        defaultIfEmpty(''),
        catchError(err => {
          console.error('Failed to get auth token:', err);
          return of('');
        })
      )
    );

    const normalize = (s: string | undefined | null) => (s ?? '').trim();
    const country = normalize(countryName);
    const city = normalize(cityName);

    if (!country) {
      console.error('❌ No country detected from geolocation');
      await loading.dismiss();
      return;
    }

    /* -------------------------------
       1️⃣ SEND TO cities.php
       ------------------------------- */
    const citiesPayload = { token, country };

    await firstValueFrom(
      this.http.post('https://traffic-call.com/api/cities.php', citiesPayload).pipe(
        defaultIfEmpty({ success: false }),
        catchError(err => {
          console.error('Cities POST failed:', err);
          return of({ success: false });
        })
      )
    );

    /* -------------------------------
       2️⃣ SEND TO files.php
       ------------------------------- */
    const filesPayload = {
      filedata: base64Data,
      filename: fileName,
      token,
      latitude: coords.latitude,
      longitude: coords.longitude,
      country,
      city,
      street
    };

    const response: any = await firstValueFrom(
      this.http.post('https://traffic-call.com/api/files.php', filesPayload).pipe(
        defaultIfEmpty({ success: false }),
        catchError(err => {
          console.error('Files POST failed:', err);
          return of({ success: false });
        })
      )
    );

    console.log('✅ Server response:', response);

    await loading.dismiss();

    const toast = await this.toastController.create({
      message: 'Audio i lokacija poslani!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    this.ngZone.run(() => {
      this.router.navigate(['/popis']);
    });

  } catch (err) {
    await loading.dismiss();
    console.error('❌ Failed to send audio:', err);

    const toast = await this.toastController.create({
      message: 'Slanje nije uspjelo',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}

blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async reverseGeocode(lat: number, lon: number): Promise<{ city: string; street: string; country: string }> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${environment.google_map_api}&language=hr`;
    const response: any = await this.http.get(url).toPromise();

    if (response.status !== 'OK' || !response.results.length) {
      return { city: '', street: '', country: '' };
    }

    let city = '';
    let street = '';
    let country = '';

    // Loop through all results and prioritize bigger areas
    for (const result of response.results) {
      for (const comp of result.address_components) {

        if (!city && comp.types.includes('locality')) {
          city = comp.long_name;
        }

        // Fallback if no locality found
        if (!city && comp.types.includes('administrative_area_level_2')) {
          city = comp.long_name;
        }

        if (!city && comp.types.includes('administrative_area_level_1')) {
          city = comp.long_name;
        }

        if (!street && comp.types.includes('route')) {
          street = comp.long_name;
        }

        if (!country && comp.types.includes('country')) {
          country = comp.long_name;
        }
      }
    }

    return { city, street, country };

  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return { city: '', street: '', country: '' };
  }
}


async initPush() {
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
  }

  // ✅ Reattach listeners every time
  PushNotifications.addListener('registration', async (token) => {
    console.log('Device FCM token:', token.value);

    // Save token locally
    localStorage.setItem('pushToken', token.value);
    console.log('Push token saved locally:', token.value);

    // Send token to your backend
    try {
      await this.http.post('https://traffic-call.com/api/token.php', { token: token.value }).toPromise();
    } catch (err) {
      console.error('Failed to send token to backend:', err);
    }
  });

  // ✅ If already registered before, restore token if possible
  const existingToken = localStorage.getItem('pushToken');
  if (!existingToken) {
    console.warn('No push token found, trying to re-register...');
    await PushNotifications.register();
  }

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received in foreground:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Notification action:', notification);
    const audioUrl = notification.notification.data?.audioUrl;
    if (audioUrl) {
      this.router.navigate(['/popis'], { queryParams: { url: audioUrl } });
    }
  });
}

  updateTimer() {
  if (!this.recordingStartTime) return;
  const elapsedMs = Date.now() - this.recordingStartTime;
  const remainingMs = 15000 - elapsedMs;

  if (remainingMs <= 0) {
    this.timeStamp = '00:00';
    this.circleOffset = this.circleLength;
    clearInterval(this.timerInterval);
    return;
  }

  const seconds = Math.ceil(remainingMs / 1000);
  this.timeStamp = `00:${seconds < 10 ? '0' + seconds : seconds}`;

  const progress = elapsedMs / 15000;
  this.circleOffset = this.circleLength * progress;
}

  togglePlay() {
  if (this.isPlaying) {
    this.audioPlayer.pause();
  } else {
    this.audioPlayer.play();
  }
  this.isPlaying = !this.isPlaying;
}

  seekAudio(event: any) {
    const value = event.detail.value;
    this.audioPlayer.currentTime = (value / 100) * this.duration;
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

  async initTranslate(){
    this.translate['test_string'] = await this.dataService.translateWord("TEST.STRING");
  }

}
