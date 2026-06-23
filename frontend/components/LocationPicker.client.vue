<script setup lang="ts">
import type { Map as LMap, Marker } from 'leaflet';

const props = defineProps<{ lat: number | null; lng: number | null; height?: string }>();
const emit = defineEmits<{ 'update:lat': [number]; 'update:lng': [number] }>();

const el = ref<HTMLElement | null>(null);
let map: LMap | null = null;
let L: typeof import('leaflet') | null = null;
let marker: Marker | null = null;

const FALLBACK: [number, number] = [27.0573, -82.194];

function setMarker(lat: number, lng: number) {
  if (!L || !map) return;
  if (marker) {
    marker.setLatLng([lat, lng]);
  } else {
    const icon = L.divIcon({
      className: '',
      html: '<div class="ft-pin"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });
    marker = L.marker([lat, lng], { icon }).addTo(map);
  }
}

async function init() {
  if (!el.value) return;
  if (!L) L = (await import('leaflet')).default ?? (await import('leaflet'));

  const hasPoint = props.lat != null && props.lng != null;
  const start: [number, number] = hasPoint ? [props.lat as number, props.lng as number] : FALLBACK;
  map = L.map(el.value).setView(start, hasPoint ? 14 : 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  if (hasPoint) setMarker(props.lat as number, props.lng as number);

  map.on('click', (e: any) => {
    const { lat, lng } = e.latlng;
    setMarker(lat, lng);
    emit('update:lat', Number(lat.toFixed(6)));
    emit('update:lng', Number(lng.toFixed(6)));
  });

  setTimeout(() => map?.invalidateSize(), 80);
}

onMounted(init);
watch(
  () => [props.lat, props.lng],
  ([la, ln]) => {
    if (la != null && ln != null) setMarker(la as number, ln as number);
  },
);
onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div
    ref="el"
    class="relative z-0 w-full cursor-crosshair overflow-hidden rounded-xl border border-gray-200"
    :style="{ height: height || '220px' }"
  />
</template>
