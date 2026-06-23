<script setup lang="ts">
import type { Map as LMap, Marker } from 'leaflet';

export interface MapPoint {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  link?: string;
}

const props = defineProps<{ points: MapPoint[]; height?: string }>();

const el = ref<HTMLElement | null>(null);
let map: LMap | null = null;
let L: typeof import('leaflet') | null = null;
let markers: Marker[] = [];

// North Port, FL fallback center
const FALLBACK: [number, number] = [27.0573, -82.194];

async function render() {
  if (!el.value) return;
  if (!L) L = (await import('leaflet')).default ?? (await import('leaflet'));

  if (!map) {
    map = L.map(el.value, { scrollWheelZoom: false }).setView(FALLBACK, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
  }

  markers.forEach((m) => m.remove());
  markers = [];

  const icon = L.divIcon({
    className: '',
    html: '<div class="ft-pin"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20],
  });

  const valid = props.points.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number',
  );
  const latlngs: [number, number][] = [];
  for (const p of valid) {
    const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
    const link = p.link ? `<br><a href="${p.link}" class="ft-pop-link">View truck →</a>` : '';
    const sub = p.subtitle ? `<br>${p.subtitle}` : '';
    m.bindPopup(`<strong>${p.title}</strong>${sub}${link}`);
    markers.push(m);
    latlngs.push([p.lat, p.lng]);
  }

  if (latlngs.length === 1) map.setView(latlngs[0], 14);
  else if (latlngs.length > 1) map.fitBounds(latlngs, { padding: [40, 40], maxZoom: 14 });

  setTimeout(() => map?.invalidateSize(), 80);
}

onMounted(render);
watch(() => props.points, render, { deep: true });
onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div
    ref="el"
    class="relative z-0 w-full overflow-hidden rounded-xl border border-gray-200"
    :style="{ height: height || '340px' }"
  />
</template>
