import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContentApiInterface, ContentObject } from 'src/app/model/content';
import { ControllerService } from 'src/app/services/controller.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HttpClient } from '@angular/common/http';
import { PushNotifications } from '@capacitor/push-notifications';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage {
  @ViewChild('waveCanvas', { static: false }) waveCanvas!: ElementRef<HTMLCanvasElement>;

  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];
  isRecording = false;
  timeStamp = '00:00';
  recordingStartTime: number | null = null;
  timerInterval: any;
  autoStopTimeout: any;

  audioPlayer = new Audio();
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;

  audioContext!: AudioContext;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  source!: MediaStreamAudioSourceNode;
  animationId!: number;
  audioUrl: string | null = null;
  recordedBlob!: Blob;
  message = '';

  translate: any = [];

  contents: Array<ContentObject> = [];

  constructor(
    private dataCtrl: ControllerService,
    private androidPermissions: AndroidPermissions,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initTranslate();
  }


  ionViewWillEnter(){
    this.dataCtrl.setHomePage(true);
    this.initPush();
  }

  ionViewWillLeave(){
    this.dataCtrl.setHomePage(false);
  }

  async requestAudioPermission(): Promise<boolean> {
  const result = await this.androidPermissions.checkPermission(
    this.androidPermissions.PERMISSION.RECORD_AUDIO
  );
   console.log('Audio permission result:', result)
  if (!result.hasPermission) {
    const granted = await this.androidPermissions.requestPermission(
      this.androidPermissions.PERMISSION.RECORD_AUDIO
    );
    console.log('Audio permission granted:', granted);
    return granted.hasPermission;
  }
  return true;
}

  async startRecording() {
  if (this.isRecording) return;

  const permissionGranted = await this.requestAudioPermission();
  if (!permissionGranted) {
    alert('Microphone permission is required.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    // Remove any previous timeout
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    // Only this recorder instance triggers sendRecording
    this.mediaRecorder.onstop = async () => {
      if (!this.audioChunks.length) return; // nothing recorded
      this.recordedBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
      this.ngZone.run(() => {
        this.audioUrl = URL.createObjectURL(this.recordedBlob);
      });

      await this.sendRecording();

      // Reset for next recording
      this.audioChunks = [];
      this.mediaRecorder = null!;
    };

    this.mediaRecorder.start();
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.timerInterval = setInterval(() => this.updateTimer(), 100);

    // Auto-stop after 15s
    this.autoStopTimeout = setTimeout(() => {
      if (this.isRecording) this.stopRecording();
    }, 15000);

  } catch (err) {
    console.error('Microphone permission denied:', err);
    alert('Microphone access is required.');
  }
}

stopRecording() {
  if (!this.isRecording) return;

  // Cancel the auto-stop timeout if still active
  if (this.autoStopTimeout) {
    clearTimeout(this.autoStopTimeout);
    this.autoStopTimeout = null;
  }

  this.mediaRecorder.stop();
  this.isRecording = false;
  clearInterval(this.timerInterval);
  this.timeStamp = '00:00';
}

toggleRecording() {
  if (this.isRecording) {
    this.stopRecording();
  } else {
    this.startRecording();
  }
}

async sendRecording() {
  if (!this.recordedBlob) return;

  try {
    const fileName = `${Date.now()}.webm`;
    console.log('Uploading file:', fileName);

    // Convert blob to base64
    let base64Data = await this.blobToBase64(this.recordedBlob);

    if (typeof base64Data === 'string') {
      const commaIndex = base64Data.indexOf(',');
      if (commaIndex !== -1) {
        base64Data = base64Data.substring(commaIndex + 1);
      }
    }

    // Get the current device token
    const deviceToken = localStorage.getItem('pushToken'); 
    if (!deviceToken) {
      console.warn('No device token found – push may not work');
    }

    // Send audio + token in the same request
    const response: any = await this.http.post(
      'https://traffic-call.com/api/files.php',
      {
        filedata: base64Data,
        filename: fileName,
        token: deviceToken,
        title: 'Nova poruka',
        body: 'Dobili ste novu audio poruku',
        data: {
          audioUrl: `https://traffic-call.com/files/${fileName}`
        }
      }
    ).toPromise();

    console.log('Full response from server:', response);

    const toast = await this.toastController.create({
      message: 'Audio poslan!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

  } catch (err) {
    console.error('Failed to send audio:', err);
    const toast = await this.toastController.create({
      message: 'Slanje audio poruke nije uspjelo',
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

async initPush() {
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
  }

  // Called when device is registered with FCM
  PushNotifications.addListener('registration', async (token) => {
    console.log('Device FCM token:', token.value);

    // Save token locally
   localStorage.setItem('pushToken', token.value);
   console.log('Push token saved locally.', token.value);

    // Send token to your backend
    await this.http.post('https://traffic-call.com/api/token.php', { token: token.value }).toPromise();
  });

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
    if (elapsedMs >= 15000) {
      this.timeStamp = '00:15';
      clearInterval(this.timerInterval);
    } else {
      const seconds = Math.floor(elapsedMs / 1000);
      const ms = Math.floor((elapsedMs % 1000) / 100);
      this.timeStamp = `00:${seconds < 10 ? '0' + seconds : seconds}.${ms}`;
    }
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
    this.translate['test_string'] = await this.dataCtrl.translateWord("TEST.STRING");
  }

}
