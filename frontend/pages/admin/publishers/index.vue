<script setup lang="ts">
import type { Account } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data: accounts, refresh } = await useAsyncData('admin-accounts', () =>
  api.get<Account[]>('/admin/publishers'),
);

async function setStatus(a: Account, status: string) {
  await api.patch(`/admin/publishers/${a._id}`, { status });
  await refresh();
}
async function remove(a: Account) {
  if (!confirm(`Delete account "${a.name}"?`)) return;
  await api.del(`/admin/publishers/${a._id}`);
  await refresh();
}

// Create / provision account
const showCreate = ref(false);
const creating = ref(false);
const createError = ref('');
const blank = () => ({ name: '', city: '', state: '', ownerEmail: '', ownerPassword: '' });
const form = reactive(blank());
const created = ref<{ ownerEmail: string; tempPassword?: string } | null>(null);

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
    const res = await api.post<{ account: Account; ownerEmail: string; tempPassword?: string }>(
      '/admin/publishers',
      { ...form, ownerPassword: form.ownerPassword || undefined },
    );
    created.value = { ownerEmail: res.ownerEmail, tempPassword: res.tempPassword };
    await refresh();
  } catch (e: any) {
    createError.value = e?.data?.message || 'Could not create the account.';
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader title="Accounts" subtitle="Customers you've issued software access to.">
      <template #actions>
        <button class="btn-primary" @click="openCreate"><Icon name="heroicons:plus" class="h-4 w-4" /> New account</button>
      </template>
    </PageHeader>

    <div class="p-8">
      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Account</th>
              <th class="px-4 py-3">Owner</th>
              <th class="px-4 py-3">Location</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="a in accounts || []" :key="a._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-navy-700">{{ a.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ a.contactEmail }}</td>
              <td class="px-4 py-3 text-gray-500">{{ a.city }}, {{ a.state }}</td>
              <td class="px-4 py-3">
                <span class="badge" :class="{
                  'bg-green-100 text-green-700': a.status === 'approved',
                  'bg-amber-100 text-amber-700': a.status === 'pending',
                  'bg-red-100 text-red-700': a.status === 'suspended',
                }">{{ a.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button v-if="a.status === 'approved'" class="btn-secondary px-3 py-1 text-xs" @click="setStatus(a, 'suspended')">Suspend</button>
                  <button v-else class="btn-primary px-3 py-1 text-xs" @click="setStatus(a, 'approved')">Activate</button>
                  <NuxtLink :to="`/admin/publishers/${a._id}`" class="btn-secondary px-3 py-1 text-xs">Edit</NuxtLink>
                  <button class="btn-danger px-3 py-1 text-xs" @click="remove(a)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="!(accounts && accounts.length)">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">No accounts yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalDialog v-if="showCreate" title="New account" @close="showCreate = false">
      <div v-if="created" class="space-y-3">
        <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
          <p class="font-medium text-green-800">Account created ✓</p>
          <p class="mt-2 text-gray-700">Share these login details with the customer:</p>
          <dl class="mt-2 space-y-1 font-mono text-xs text-gray-800">
            <div>Email: <span class="font-semibold">{{ created.ownerEmail }}</span></div>
            <div v-if="created.tempPassword">Temp password: <span class="font-semibold">{{ created.tempPassword }}</span></div>
            <div v-else>Password: <span class="italic">(the one you set)</span></div>
          </dl>
          <p class="mt-2 text-xs text-gray-500">They sign in at /login, set up their white label, and create their calendars.</p>
        </div>
      </div>
      <div v-else class="space-y-4">
        <div><label class="label">Account / customer name</label><input v-model="form.name" class="input" placeholder="North Port Matters" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">City</label><input v-model="form.city" class="input" /></div>
          <div><label class="label">State</label><input v-model="form.state" class="input" /></div>
        </div>
        <hr />
        <div><label class="label">Owner login email</label><input v-model="form.ownerEmail" type="email" class="input" placeholder="owner@example.com" /></div>
        <div><label class="label">Temp password <span class="text-gray-400">(optional — auto-generated)</span></label><input v-model="form.ownerPassword" class="input" placeholder="leave blank to auto-generate" /></div>
        <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
      </div>
      <template #footer>
        <button v-if="created" class="btn-primary" @click="showCreate = false">Done</button>
        <template v-else>
          <button class="btn-secondary" @click="showCreate = false">Cancel</button>
          <button class="btn-primary" :disabled="creating" @click="submitCreate">{{ creating ? 'Creating…' : 'Create account' }}</button>
        </template>
      </template>
    </ModalDialog>
  </div>
</template>
