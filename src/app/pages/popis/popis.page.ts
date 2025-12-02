import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-popis',
  templateUrl: './popis.page.html',
  styleUrls: ['./popis.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule]
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

  //Reset play icon when the audio ends (always re-runs in Angular)
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
      this.audios = response.map((file, index) => {

        const [datePart, timePart] = (file.title || '').split(' ');

        let formattedDate = '';
        if (datePart) {
          const date = new Date(datePart);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          formattedDate = `${day}.${month}.${year}`;
        }

        const formattedTime = timePart ? timePart.slice(0, 5) : '';

        return {
          name: file.title || file.filename,
          url: file.filename,
          latitude: file.latitude,
          longitude: file.longitude,
          mapId: `map-${index}`,
          isPlaying: false,
          showMap: false,
          city: file.city,
          street: file.street,
          date: formattedDate, 
          time: formattedTime
        };
      });

      //Initialize maps correctly (not the whole array)
      setTimeout(() => {
        this.audios.forEach(audio => {
          if (audio.showMap) {
            this.initMap(audio);
          }
        });
      }, 300);

      //Automatically play the first audio (with jingle)
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
  const jingleUrl = 'assets/jingle.wav';

  //If clicking the same audio (pause/resume)
  if (this.currentAudio === audio) {
    if (audio.isPlaying) {
      // Pause audio
      this.audioPlayer.pause();
      audio.isPlaying = false;

      //Hide map when paused
      audio.showMap = false;
    } else {
      // Resume audio
      this.audioPlayer.play().catch(err => console.warn('Play blocked:', err));
      audio.isPlaying = true;

      //Show map when resumed
      audio.showMap = true;
      setTimeout(() => this.initMap(audio), 420);
    }
    return;
  }

  //Stop previous audio and hide its map
  if (this.currentAudio) {
    this.currentAudio.isPlaying = false;
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.currentAudio.showMap = false;
  }

  //Set current audio
  this.currentAudio = audio;
  audio.isPlaying = true;
  audio.showMap = true;

  // Play jingle
  const jingle = new Audio(jingleUrl);
  jingle.play().catch(err => console.warn('Jingle blocked:', err));

  jingle.addEventListener('ended', () => {
    // After jingle, play main audio
    this.audioPlayer.src = `https://traffic-call.com/files/${audio.url}`;

    this.audioPlayer.onended = null;
    this.audioPlayer.play()
      .then(() => console.log('Playing main audio:', audio.name))
      .catch(err => console.warn('Main audio play blocked:', err));

    //Initialize map
    setTimeout(() => this.initMap(audio), 420);

    //Reset after finished
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

loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.google_map_api}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject('Google Maps failed to load.');
    document.head.appendChild(script);
  });
}

async initMap(audio: any) {
  const mapId = audio.mapId;
  
  // Wait until the element actually exists
  await this.waitForElement(`#${mapId}`);

  const mapContainer = document.getElementById(mapId);
  if (!mapContainer) return;

  await this.loadGoogleMaps();

  const lat = parseFloat(audio.latitude);
  const lon = parseFloat(audio.longitude);
  if (isNaN(lat) || isNaN(lon)) return;

  const map = new google.maps.Map(mapContainer, {
    center: { lat, lng: lon },
    zoom: 17,
    disableDefaultUI: true,
  });

  const markerIcon = {
    url: 'assets/google_map_marker.png',
    scaledSize: new google.maps.Size(70, 50),
    anchor: new google.maps.Point(20, 50),
  };

  new google.maps.Marker({
    position: { lat, lng: lon },
    map,
    icon: markerIcon,
  });
}

private waitForElement(selector: string): Promise<void> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      const el2 = document.querySelector(selector);
      if (el2) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
