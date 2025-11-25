import { Injectable } from '@angular/core';
import { ControllerService } from './controller.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContentObject } from '../model/content';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

export enum AlertType {
  Success = 'success',
  Warning = 'warning',
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  url: string = '/api/content/structure?pagination=0';
  content: Array<ContentObject> = [];
  content_signature: string = '';
  loader: any;

  constructor(
    private apiCtrl: ControllerService,
    private translateCtrl: TranslateService,
    private toastController: ToastController
  ) {
    this.getContentLoad();
  }

  private async checkCache(){
    let url: string = this.url;

    // first check cache
    let cachedData = await this.apiCtrl.checkCache(environment.cache_key + url, 0).catch(err => {return undefined;});

    if(cachedData != undefined && cachedData?.status == true && cachedData?.message == 'success'){
      if(cachedData?.signature != this.content_signature){
        // new data
        this.content = [];
        cachedData.data['data'].map((item:any) => {
          let object_content = new ContentObject(item);
          this.content.push(object_content);
        });
        this.content_signature = cachedData?.signature;
        console.log('new fresh data from cache');
      }else{
        // do nothing because data is same like before
      }
      return true;
    }else{
      return false;
    }
  }

  private async checkServer(){
    let url: string = this.url;
    let cache_time:number;
    if(environment.production) {
      cache_time = 60*60*2; // 6 hours
    }else{
      cache_time = 60 * 5; // 5sec
    }
    let response = await this.apiCtrl.getServer(url, true, cache_time).catch(err => {
      return undefined;
    });

    if(response != undefined && response?.['message'] == 'success'){
      if(response['signature'] != this.content_signature){
        // new data
        this.content = [];
        response.data['data'].map((item:any) => {
          let object_content = new ContentObject(item);
          this.content.push(object_content);
        });
        this.content_signature = response['signature'];
        console.log('get new data dfrom server');
      }else{
        // do nothing because data is same like before
      }
      return true;
    }else{
      return false;
    }
  }

  private async getContentLoad(){
    let server: boolean = false;
    let cache: boolean = await this.checkCache();
    if(!cache){
      if(this.loader == false){
        await this.apiCtrl.showLoader();
        this.loader = true;
      }
      server = await this.checkServer();
      if(this.loader == true){
        await this.apiCtrl.hideLoader();
        this.loader = false;
      }
    }
    else{
      this.checkServer();
    }
    return (server || cache);
  }

  async getRootContent(){
    await this.getContentLoad();

    let categories = this.content.filter(item => (item.content_parent == null));

    categories.sort((a,b) => {
      let order_a = a.content_order;
      let order_b = b.content_order;
      let id_a = a.content_id;
      let id_b = b.content_id;

      if(isNaN(order_a) || isNaN(order_b)){
        return (id_a < id_b) ? -1 : (id_a > id_b) ? 1 : 0;
      }else{
        return (order_a < order_b) ? -1 : 1;
      }
    });

    return categories;
  }

  async getCategoryContent(id: number){
    await this.getContentLoad();

    let categories = this.content.filter(item => item.content_parent_id != null && item.content_parent_id == id);

    categories.sort((a,b) => {
      let order_a = a.content_order;
      let order_b = b.content_order;
      let id_a = a.content_id;
      let id_b = b.content_id;

      if(isNaN(order_a) || isNaN(order_b)){
        return (id_a < id_b) ? -1 : (id_a > id_b) ? 1 : 0;
      }else{
        return (order_a < order_b) ? -1 : 1;
      }
    });

    return categories;
  }

  async getContent(id: number){
    await this.getContentLoad();

    let content = this.content.filter(item => item.content_id == id);

    return content[0];
  }

  async showToast(message: string, color='primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }

  hideLoader() {
  if (this.loader) {
    this.loader.dismiss();
    this.loader = null;
  }
}


  translateWord(key: string): Promise<string>{
    let promise = new Promise<string>((resolve, reject) => {
      this.translateCtrl.get(key).toPromise().then( value => {
        resolve(value);
        }
      );
    });
    return promise;
  }
}
