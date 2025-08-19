import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://kkepoqbsvbsnchoxwmln.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZXBvcWJzdmJzbmNob3h3bWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDg3MTgsImV4cCI6MjA3MTEyNDcxOH0.1PRjYxl5-Q5q2it7dSgs6xjeRJeTUitXiqVsr3G1Bmc',
        {
        auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: localStorage
        }
    }
    );
  }

  get client() {
    return this.supabase;
  }

  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  }

  // Get public URL for a file
  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

}
