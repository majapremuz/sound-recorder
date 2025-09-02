import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popis',
  templateUrl: './popis.page.html',
  styleUrls: ['./popis.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PopisPage implements OnInit {
  audios: any[] = [];
  audioPlayer = new Audio();
  currentAudio: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAudios();

    // Reset when audio ends
    this.audioPlayer.addEventListener('ended', () => {
      if (this.currentAudio) {
        this.currentAudio.isPlaying = false; // switch back icon
        this.currentAudio = null; // clear reference
      }
    });
  }

  async loadAudios() {
    try {
      const response: any = await this.http.get('https://traffic-call.com/api/filelist.php').toPromise();
      console.log('Raw response from server:', response);

      if (Array.isArray(response)) {
        this.audios = response.map(file => ({
          name: file.title || file.filename,
          url: `https://traffic-call.com/files/${file.filename}`,
          isPlaying: false
        }));
      } else {
        console.warn('Unexpected response format:', response);
        this.audios = [];
      }
    } catch (err) {
      console.error('Failed to load audios:', err);
      this.audios = [];
    }
  }

  playAudio(audio: any) {
    // If the same audio is clicked -> toggle play/pause
    if (this.currentAudio === audio) {
      if (audio.isPlaying) {
        this.audioPlayer.pause();
        audio.isPlaying = false;
      } else {
        this.audioPlayer.play();
        audio.isPlaying = true;
      }
      return;
    }

    // Stop previous audio if another one is playing
    if (this.currentAudio) {
      this.currentAudio.isPlaying = false;
      this.audioPlayer.pause();
    }

    // Start new audio
    this.audioPlayer.src = audio.url;
    this.audioPlayer.play();
    audio.isPlaying = true;
    this.currentAudio = audio;
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
