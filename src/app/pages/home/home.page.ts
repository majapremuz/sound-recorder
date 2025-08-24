import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContentApiInterface, ContentObject } from 'src/app/model/content';
import { ControllerService } from 'src/app/services/controller.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from 'src/app/services/supabase.service';
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
    private supabaseService: SupabaseService,
    private toastController: ToastController,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.initTranslate();
  }


  ionViewWillEnter(){
    this.dataCtrl.setHomePage(true);
    // do something when in moment home page opens
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
  if (this.isRecording) return; // prevent double clicks

  const permissionGranted = await this.requestAudioPermission();
  if (!permissionGranted) {
    alert('Microphone permission is required.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      this.recordedBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
      this.ngZone.run(() => {
        this.audioUrl = URL.createObjectURL(this.recordedBlob);
      });

      // Auto-send after recording finishes
      await this.sendRecording();
    };

    this.mediaRecorder.start();
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.timerInterval = setInterval(() => this.updateTimer(), 100);

    // Stop after 15s exactly
    setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
      }
    }, 15000);

  } catch (err) {
    console.error('Microphone permission denied:', err);
    alert('Microphone access is required.');
  }
}

stopRecording() {
  if (!this.isRecording) return;
  this.mediaRecorder.stop();
  this.isRecording = false;
  clearInterval(this.timerInterval);
  this.timeStamp = '00:00';
}


async sendRecording() {
  if (!this.recordedBlob) return;

  try {
    const fileName = `${Date.now()}.webm`;

    // Convert Blob to File
    const file = new File([this.recordedBlob], fileName, { type: 'audio/webm' });

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload to your API (placeholder URL for now)
    const response: any = await this.http.post('https://your-api.com/upload', formData).toPromise();

    // Assume API responds with file URL
    const audioUrl = response.url || '';

    console.log('File uploaded to API:', audioUrl);

    // Trigger push notification with URL
    await this.triggerPushNotification(audioUrl);

    const toast = await this.toastController.create({
      message: 'Audio uploaded & notification sent!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

  } catch (err) {
    console.error('Upload failed:', err);
    const toast = await this.toastController.create({
      message: 'Failed to send audio',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
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

  // Called when device is registered with FCM
  PushNotifications.addListener('registration', async (token) => {
  console.log('Device FCM token:', token.value);

  // Save token to Supabase
  await this.supabaseService.client
    .from('device_tokens')
    .upsert({ token: token.value });
});


  // Called when a notification is received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received in foreground:', notification);
  });

  // Called when the user taps the notification
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Notification action:', notification);

    const audioUrl = notification.notification.data?.audioUrl;
    if (audioUrl) {
      // navigate to a route that plays the audio
      this.router.navigate(['/popis'], {
        queryParams: { url: audioUrl }
      });
    }
  });
}

private async triggerPushNotification(audioUrl: string) {
  await this.supabaseService.client.functions.invoke('send-push', {
    body: { audioUrl }
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
