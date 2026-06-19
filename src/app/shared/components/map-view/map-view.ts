import { Component, Input, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  status?: string;
  popupContent?: string;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [],
  template: `
    <div
      class="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
      [style.height.px]="height"
    >
      <div #mapContainer class="w-full h-full"></div>
    </div>
  `,
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @Input() markers: MapMarker[] = [];
  @Input() height = 400;
  @Input() centerLat = 20;
  @Input() centerLng = 0;
  @Input() zoom = 2;
  @Input() clickable = false;

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.centerLat, this.centerLng],
      zoom: this.zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.addMarkers();
  }

  private addMarkers(): void {
    this.markers.forEach((marker) => {
      const color = this.getStatusColor(marker.status);
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const m = L.marker([marker.latitude, marker.longitude], { icon }).addTo(this.map!);

      if (marker.popupContent) {
        m.bindPopup(marker.popupContent);
      }
    });

    if (this.markers.length > 0) {
      const bounds = L.latLngBounds(
        this.markers.map((m) => [m.latitude, m.longitude] as [number, number]),
      );
      this.map?.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  private getStatusColor(status?: string): string {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'baseline':
        return '#3B82F6';
      case 'registered':
        return '#7B2FBE';
      case 'completed':
        return '#059669';
      case 'closed':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  }
}
