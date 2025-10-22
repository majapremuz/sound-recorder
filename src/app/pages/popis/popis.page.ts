import { Component, OnInit } from '@angular/core';
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

  toggleMap(audio: any) {
  this.audios.forEach(a => {
    if (a !== audio) a.showMap = false;
  });

  audio.showMap = !audio.showMap;

  if (audio.showMap) {
    setTimeout(() => this.initMap(audio), 420);
  }
}

  playAudio(audio: any) {
  const jingleUrl = 'assets/jingle.mp3';

  // toggle same audio
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

  // stop previous
  if (this.currentAudio) {
    this.currentAudio.isPlaying = false;
    this.audioPlayer.pause();
  }

  // set new current
  audio.isPlaying = true;
  this.currentAudio = audio;

  // play jingle then main audio
  const jingle = new Audio(jingleUrl);
  jingle.play();

  jingle.addEventListener('ended', () => {
    this.audioPlayer.src = audio.url;
    this.audioPlayer.play();

    // initialize map after the slide animation finishes
    setTimeout(() => this.initMap(audio), 420);
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
      scrollWheelZoom: true,
      tap: true,
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
