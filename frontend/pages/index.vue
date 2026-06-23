<script setup lang="ts">
useHead({ title: 'On The Spot — Local Discovery for Newsletter Publishers' });

const features = [
  { icon: 'heroicons:truck', title: 'Food Trucks', text: 'Weekly schedules and live locations.' },
  { icon: 'heroicons:musical-note', title: 'Live Music', text: 'Gigs, bands, and venues.' },
  { icon: 'heroicons:building-storefront', title: 'Businesses', text: 'A local directory readers trust.' },
  { icon: 'heroicons:shopping-bag', title: 'Markets & Vendors', text: 'Farmers markets and pop-ups.' },
];

// Demo hubs to explore
const hubs = [
  { sub: 'northport', name: 'North Port Matters', place: 'North Port, FL' },
  { sub: 'westvalley', name: 'West Valley Shoutouts', place: 'Buckeye, AZ' },
];
</script>

<template>
  <div>
    <section class="bg-navy-900 text-white">
      <div class="mx-auto max-w-5xl px-4 py-20 text-center">
        <p class="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          White-label local discovery
        </p>
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Turn your newsletter into a local discovery hub
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-navy-100">
          Give your community one simple place to see what's happening — food trucks, live music,
          events, markets, and local businesses — all on your own branded site.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <NuxtLink to="/claim" class="btn-primary px-6 py-3 text-base">Claim Your Local Hub</NuxtLink>
          <NuxtLink to="/login" class="btn-secondary px-6 py-3 text-base">Sign in</NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-14">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="f in features" :key="f.title" class="card p-6">
          <Icon :name="f.icon" class="h-8 w-8 text-brand-600" />
          <h3 class="mt-3 font-semibold text-gray-900">{{ f.title }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ f.text }}</p>
        </div>
      </div>
    </section>

    <section class="border-t border-gray-200 bg-white">
      <div class="mx-auto max-w-6xl px-4 py-14">
        <h2 class="text-xl font-semibold text-gray-900">See a live hub</h2>
        <p class="mt-1 text-gray-500">Explore demo communities running on On The Spot.</p>
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="h in hubs"
            :key="h.sub"
            :to="`/${h.sub}`"
            class="card flex items-center justify-between p-5 transition hover:shadow-md"
          >
            <div>
              <p class="font-semibold text-gray-900">{{ h.name }}</p>
              <p class="text-sm text-gray-500">{{ h.place }}</p>
            </div>
            <span class="text-brand-600">Visit →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="bg-brand-600 text-white">
      <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-12 text-center sm:flex-row sm:text-left">
        <div>
          <h2 class="text-2xl font-bold">Ready to launch your local hub?</h2>
          <p class="text-brand-100">Pick your subdomain and start in minutes.</p>
        </div>
        <NuxtLink to="/claim" class="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
          Claim Your Hub
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
