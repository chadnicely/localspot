<script setup lang="ts">
import type { Publisher } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data: publishers, refresh } = await useAsyncData('admin-publishers', () =>
  api.get<Publisher[]>('/admin/publishers'),
);

async function setStatus(p: Publisher, status: string) {
  await api.patch(`/admin/publishers/${p._id}`, { status });
  await refresh();
}
async function remove(p: Publisher) {
  if (!confirm(`Delete hub "${p.name}"? This does not delete its listings' data.`)) return;
  await api.del(`/admin/publishers/${p._id}`);
  await refresh();
}

// ---- Create / assign a hub ----
const showCreate = ref(false);
const creating = ref(false);
const createError = ref('');
const blank = () => ({ name: '', subdomain: '', city: '', state: '', ownerEmail: '', ownerPassword: '' });
const form = reactive(blank());
const created = ref<{ ownerEmail: string; tempPassword?: string; subdomain: string } | null>(null);

watch(
  () => form.name,
  (v) => {
    if (!form.subdomain) form.subdomain = v.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  },
);

function openCreate() {
  Object.assign(form, blank());
  created.value = null;
  createError.value = '';
  showCreate.value = true;
}

async function submitCreate() {
  createError.value = '';
  creating.value = true;
  try {
    const res = await api.post<{ publisher: Publisher; ownerEmail: string; tempPassword?: string }>(
      '/admin/publishers',
      { ...form, ownerPassword: form.ownerPassword || undefined },
    );
    created.value = { ownerEmail: res.ownerEmail, tempPassword: res.tempPassword, subdomain: res.publisher.subdomain };
    await refresh();
  } catch (e: any) {
    createError.value = e?.data?.message || 'Could not create the hub.';
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader title="Publishers" subtitle="Every local hub on the platform.">
      <template #actions>
        <button class="btn-primary" @click="openCreate">
          <Icon name="heroicons:plus" class="h-4 w-4" /> Create hub
        </button>
      </template>
    </PageHeader>
    <div class="p-8">
      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Hub</th>
              <th class="px-4 py-3">Subdomain</th>
              <th class="px-4 py-3">Location</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in publishers || []" :key="p._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-navy-700">{{ p.name }}</td>
              <td class="px-4 py-3">
                <a :href="`/${p.subdomain}`" target="_blank" class="text-brand-600">/{{ p.subdomain }}</a>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ p.city }}, {{ p.state }}</td>
              <td class="px-4 py-3">
                <span
                  class="badge"
                  :class="{
                    'bg-green-100 text-green-700': p.status === 'approved',
                    'bg-amber-100 text-amber-700': p.status === 'pending',
                    'bg-red-100 text-red-700': p.status === 'suspended',
                  }"
                >{{ p.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button v-if="p.status !== 'approved'" class="btn-primary px-3 py-1 text-xs" @click="setStatus(p, 'approved')">Approve</button>
                  <button v-if="p.status === 'approved'" class="btn-secondary px-3 py-1 text-xs" @click="setStatus(p, 'suspended')">Suspend</button>
                  <NuxtLink :to="`/admin/publishers/${p._id}`" class="btn-secondary px-3 py-1 text-xs">Edit</NuxtLink>
                  <button class="btn-danger px-3 py-1 text-xs" @click="remove(p)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="!(publishers && publishers.length)">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">No publishers yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalDialog v-if="showCreate" title="Create a hub" @close="showCreate = false">
      <!-- Success: show credentials to hand off -->
      <div v-if="created" class="space-y-3">
        <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
          <p class="font-medium text-green-800">Hub created and assigned ✓</p>
          <p class="mt-2 text-gray-700">Share these login details with the publisher:</p>
          <dl class="mt-2 space-y-1 font-mono text-xs text-gray-800">
            <div>Hub: <span class="font-semibold">/{{ created.subdomain }}</span></div>
            <div>Email: <span class="font-semibold">{{ created.ownerEmail }}</span></div>
            <div v-if="created.tempPassword">Temp password: <span class="font-semibold">{{ created.tempPassword }}</span></div>
            <div v-else>Password: <span class="italic">(the one you set)</span></div>
          </dl>
          <p class="mt-2 text-xs text-gray-500">They sign in at /login and set up their white-label branding.</p>
        </div>
      </div>

      <!-- Form -->
      <div v-else class="space-y-4">
        <div>
          <label class="label">Hub / newsletter name</label>
          <input v-model="form.name" class="input" placeholder="North Port Matters" />
        </div>
        <div>
          <label class="label">Subdomain</label>
          <div class="flex items-center gap-2">
            <input v-model="form.subdomain" class="input" placeholder="northport" />
            <span class="whitespace-nowrap text-sm text-gray-400">.onthespot.com</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">City</label><input v-model="form.city" class="input" /></div>
          <div><label class="label">State</label><input v-model="form.state" class="input" /></div>
        </div>
        <hr />
        <div>
          <label class="label">Publisher's login email</label>
          <input v-model="form.ownerEmail" type="email" class="input" placeholder="owner@example.com" />
        </div>
        <div>
          <label class="label">Temp password <span class="text-gray-400">(optional — auto-generated if blank)</span></label>
          <input v-model="form.ownerPassword" class="input" placeholder="leave blank to auto-generate" />
        </div>
        <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
      </div>

      <template #footer>
        <button v-if="created" class="btn-primary" @click="showCreate = false">Done</button>
        <template v-else>
          <button class="btn-secondary" @click="showCreate = false">Cancel</button>
          <button class="btn-primary" :disabled="creating" @click="submitCreate">
            {{ creating ? 'Creating…' : 'Create & assign' }}
          </button>
        </template>
      </template>
    </ModalDialog>
  </div>
</template>

