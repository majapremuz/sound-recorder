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
  // Flip the state first
  this.notificationsEnabled = !this.notificationsEnabled;

  // Save to storage
  localStorage.setItem('notificationsEnabled', JSON.stringify(this.notificationsEnabled));

  // Make sure permissions are granted
  const permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    await PushNotifications.requestPermissions();
  }

  // Get stored token (from registration step)
  const token = localStorage.getItem('pushToken');

  if (token) {
    await this.http.post(
      'https://traffic-call.com/api/pushchange.php',
      { token, active: this.notificationsEnabled ? 1 : 0 }
    ).toPromise();
  }

  console.log('Notifications ' + (this.notificationsEnabled ? 'enabled' : 'disabled'));
}

  navigateTo(page: string) {
    this.router.navigate([`/${page}`]);
  }

}
