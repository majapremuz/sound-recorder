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
  isPlaying = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAudios();
  }

async loadAudios() {
  try {
    // Treat response as text
    const response = await this.http.get('https://traffic-call.com/api/files.php', { responseType: 'text' }).toPromise() as string;
    console.log('Raw response from server:', response);

    let audiosArray: any[] = [];

    try {
      // Try parsing JSON first
      audiosArray = JSON.parse(response);
      if (!Array.isArray(audiosArray)) audiosArray = [];
    } catch {
      // Fallback: split lines, trim, filter out HTML tags / empty lines
      audiosArray = response
  .split('\n')
  .map(f => f.trim())
  .filter(f => f && f.endsWith('.webm'))  // keep only proper .webm filenames
  .map(f => ({ name: f.replace(/[^a-zA-Z0-9_\-\.]/g, ''), url: `https://traffic-call.com/files/${f.replace(/[^a-zA-Z0-9_\-\.]/g, '')}` }));
    }

    this.audios = audiosArray;

    if (!this.audios.length) {
      console.warn('No valid audios returned from server.');
    }

    console.log('Loaded audios:', this.audios);

  } catch (err) {
    console.error('Failed to load audios:', err);
    this.audios = [];
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

playAudio(audio: any) {
  this.audioPlayer.src = audio.url;
  this.audioPlayer.play();
  this.isPlaying = true;
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
