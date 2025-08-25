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
      const response: any = await this.http.get('https://traffic-call.com/api/files.php').toPromise();
      this.audios = response.audios || [];
    } catch (err) {
      console.error('Failed to load audios:', err);
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


  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
