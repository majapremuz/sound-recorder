import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';

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
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
  this.loadAudios();

  // ✅ Reset play icon when the audio ends (always re-runs in Angular)
  this.audioPlayer.addEventListener('ended', () => {
    if (this.currentAudio) {
      this.ngZone.run(() => {
        console.log('Audio ended:', this.currentAudio.name);
        this.currentAudio.isPlaying = false;
        this.currentAudio = null;
      });
    }
  });
}

  onViewDidEnter() {
    // Once the view and animations are ready
    if (this.audios.length > 0) {
      setTimeout(() => {
        this.audios.forEach(audio => {
          if (audio.showMap) {
            this.initMap(audio);
          }
        });
      }, 400);
    }
  }

  async loadAudios() {
  try {
    const response: any = await this.http.get('https://traffic-call.com/api/filelist.php').toPromise();
    console.log('Raw response from server:', response);

    if (Array.isArray(response)) {
      this.audios = response.map((file, index) => ({
        name: file.title || file.filename,
        url: file.filename,
        latitude: file.latitude,
        longitude: file.longitude,
        mapId: `map-${index}`,
        isPlaying: false,
        showMap: false
      }));

      // ✅ Initialize maps correctly (not the whole array)
      setTimeout(() => {
        this.audios.forEach(audio => {
          if (audio.showMap) {
            this.initMap(audio);
          }
        });
      }, 300);

      // ✅ Automatically play the first audio (with jingle)
      if (this.audios.length > 0) {
        const firstAudio = this.audios[0];
        console.log('Auto-playing first audio:', firstAudio.name);

        firstAudio.showMap = true;
        setTimeout(() => this.initMap(firstAudio), 500);


        setTimeout(() => {
          try {
            this.playAudio(firstAudio);
          } catch (e) {
            console.warn('Autoplay failed (blocked by browser):', e);
          }
        }, 800);
      }

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
  const jingleUrl = 'assets/jingle.mp3';

  // 🎧 If clicking the same audio (pause/resume)
  if (this.currentAudio === audio) {
    if (audio.isPlaying) {
      // 🔴 Pause audio
      this.audioPlayer.pause();
      audio.isPlaying = false;

      // 🔒 Hide map when paused
      audio.showMap = false;
    } else {
      // ▶️ Resume audio
      this.audioPlayer.play().catch(err => console.warn('Play blocked:', err));
      audio.isPlaying = true;

      // 🗺 Show map when resumed
      audio.showMap = true;
      setTimeout(() => this.initMap(audio), 420);
    }
    return;
  }

  // 🛑 Stop previous audio and hide its map
  if (this.currentAudio) {
    this.currentAudio.isPlaying = false;
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.currentAudio.showMap = false;
  }

  // 🆕 Set current audio
  this.currentAudio = audio;
  audio.isPlaying = true;
  audio.showMap = true; // 🗺 show map automatically

  // ▶️ Play jingle
  const jingle = new Audio(jingleUrl);
  jingle.play().catch(err => console.warn('Jingle blocked:', err));

  jingle.addEventListener('ended', () => {
    // 🎵 After jingle, play main audio
    this.audioPlayer.src = `https://traffic-call.com/files/${audio.url}`;

    this.audioPlayer.onended = null;
    this.audioPlayer.play()
      .then(() => console.log('Playing main audio:', audio.name))
      .catch(err => console.warn('Main audio play blocked:', err));

    // 🗺 Initialize map
    setTimeout(() => this.initMap(audio), 420);

    // ✅ Reset after finished
    this.audioPlayer.addEventListener('ended', () => {
      this.ngZone.run(() => {
        console.log('✅ Main audio finished:', audio.name);
        audio.isPlaying = false;
        audio.showMap = false; // Hide map when done
        this.currentAudio = null;
      });
    }, { once: true });
  });

  jingle.addEventListener('error', () => {
    this.ngZone.run(() => {
      console.warn('Jingle playback failed');
      audio.isPlaying = false;
      audio.showMap = false;
      this.currentAudio = null;
    });
  });
}

initMap(audio: any) {
  const mapContainer = document.getElementById(audio.mapId);
  if (!mapContainer) return;

  const lat = parseFloat(audio.latitude);
  const lon = parseFloat(audio.longitude);

  // ❌ stop if coordinates are invalid
  if (isNaN(lat) || isNaN(lon)) {
    console.warn('No valid location for:', audio.name);
    return;
  }

  const center: [number, number] = [lat, lon];
  console.log('Marker coordinates used:', center);

  if ((mapContainer as any)._leaflet_map) {
    const map = (mapContainer as any)._leaflet_map;
    setTimeout(() => {
      map.invalidateSize();
      map.setView(center, 20);
    }, 400);
    return;
  }

  audio.isLoading = true;

  setTimeout(() => {
    const map = L.map(audio.mapId, {
      center,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true
    });

    (mapContainer as any)._leaflet_map = map;

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      detectRetina: true,
    }).addTo(map);

    tileLayer.on('load', () => {
      audio.isLoading = false;
      map.invalidateSize();
      map.setView(center, 20);
    });

    const customIcon = L.icon({
      iconUrl: 'assets/map marker.png',
      iconSize: [35, 45],
      iconAnchor: [17, 45],
    });

    L.marker(center, { icon: customIcon }).addTo(map);
    setTimeout(() => map.invalidateSize(), 900);
  }, 400);
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
