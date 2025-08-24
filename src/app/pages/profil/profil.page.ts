import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PushNotifications } from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ProfilPage implements OnInit {
  notificationsEnabled = true;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // Load saved state from storage
    const saved = localStorage.getItem('notificationsEnabled');
    this.notificationsEnabled = saved !== null ? JSON.parse(saved) : true;
  }

  async toggleNotifications() {
    localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled));

    if (this.notificationsEnabled) {
      // Re-enable notifications
      const permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
      }

      // TODO: send token back to backend again
      console.log('Notifications enabled');
    } else {
      // Disable: remove token from backend
      const token = (await PushNotifications.getDeliveredNotifications()).notifications?.[0]?.id;
      // Call your backend to unregister this device
      await this.http.post('https://your-api.com/disable-token', { token }).toPromise();
      console.log('Notifications disabled');
    }
  }

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
