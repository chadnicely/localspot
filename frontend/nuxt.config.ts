// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-10-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon'],
  css: ['leaflet/dist/leaflet.css', '~/assets/css/main.css'],
  icon: {
    // Bundle the locally-installed Heroicons set so no runtime network is needed.
    serverBundle: 'local',
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },
  app: {
    head: {
      title: 'North Port Food Truck Calendar',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Find local food trucks this week — see where they are serving each day around town.',
        },
      ],
    },
  },
});
