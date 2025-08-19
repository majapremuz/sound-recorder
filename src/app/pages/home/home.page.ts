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

  async toggleRecording() {
  if (!this.isRecording) {
    const permissionGranted = await this.requestAudioPermission();
    if (!permissionGranted) {
      alert('Microphone permission is required.');
      return; 
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.startWaveform(stream);

      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

        this.mediaRecorder.onstop = async () => {
          this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });

          this.ngZone.run(() => {
            this.audioUrl = URL.createObjectURL(this.recordedBlob);
            console.log("Preview ready:", this.audioUrl);
          });
  };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.timerInterval = setInterval(() => this.updateTimer(), 100);

      // Auto-stop after 15s (but DO NOT auto-send)
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, 15000);

    } catch (err) {
      console.error('Microphone permission denied:', err);
      alert('Microphone access is required.');
    }

  } else {
    this.stopRecording();
  }
}

stopRecording() {
  if (!this.isRecording) return;
  this.mediaRecorder.stop();
  this.stopWaveform();
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

    // Upload to "audios" bucket
    await this.supabaseService.uploadFile('audios', fileName, file);

    // Get public URL
    const publicUrl = this.supabaseService.getPublicUrl('audios', fileName);
    console.log('File uploaded:', publicUrl);

    // Trigger push notifications
    await this.triggerPushNotification(publicUrl);

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
      this.router.navigate(['/player'], {
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

  startWaveform(stream: MediaStream) {
  this.audioContext = new AudioContext();
  this.source = this.audioContext.createMediaStreamSource(stream);
  this.analyser = this.audioContext.createAnalyser();
  this.analyser.fftSize = 256;

  const bufferLength = this.analyser.frequencyBinCount;
  this.dataArray = new Uint8Array(bufferLength);

  this.source.connect(this.analyser);

  const canvas = this.waveCanvas.nativeElement;
  const canvasCtx = canvas.getContext('2d')!;
  const WIDTH = canvas.width = canvas.offsetWidth;
  const HEIGHT = canvas.height = canvas.offsetHeight;

  const draw = () => {
    this.animationId = requestAnimationFrame(draw);
    this.analyser.getByteTimeDomainData(this.dataArray);

    canvasCtx.fillStyle = '#222222';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#ff0479';
    canvasCtx.beginPath();

    let sliceWidth = WIDTH / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
  };

  draw();
}

stopWaveform() {
  cancelAnimationFrame(this.animationId);
  if (this.audioContext) {
    this.audioContext.close();
  }
}


  async initTranslate(){
    this.translate['test_string'] = await this.dataCtrl.translateWord("TEST.STRING");
  }

}
