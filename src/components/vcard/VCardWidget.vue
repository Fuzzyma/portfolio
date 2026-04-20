<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import QRCode from "qrcode";
import { buildVCard, type VCardSocialEntry } from "../../lib/vcard";

interface Entry {
  id: string;
  name: string;
  handle: string;
  url: string;
}

const emailEntries: Entry[] = [
  {
    id: "email-1",
    name: "Email",
    handle: "mail@fuzzyma.de",
    url: "mailto:mail@fuzzyma.de",
  },
];

const phoneEntries: Entry[] = [
  {
    id: "phone-1",
    name: "Phone",
    handle: "+49 151 10 29 42 67",
    url: "tel:+4915110294267",
  },
];

const socialEntries: Entry[] = [
  {
    id: "social-github",
    name: "GitHub",
    handle: "Fuzzyma",
    url: "https://github.com/Fuzzyma",
  },
  {
    id: "social-linkedin",
    name: "LinkedIn",
    handle: "ulima",
    url: "https://linkedin.com/in/ulima",
  },
  {
    id: "social-bluesky",
    name: "Bluesky",
    handle: "fuzzyma.bsky.social",
    url: "https://bsky.app/profile/fuzzyma.bsky.social",
  },
];

const includeName = ref(true);
const includeWebsite = ref(true);
const includeBio = ref(true);

const checked = ref<Record<string, boolean>>({
  "email-1": true,
  "phone-1": true,
  "social-github": false,
  "social-linkedin": true,
  "social-bluesky": false,
});

const vcardString = computed(() => {
  const selectedEmails = emailEntries
    .filter((e) => checked.value[e.id])
    .map((e) => e.url.replace("mailto:", ""));

  const selectedPhones = phoneEntries
    .filter((e) => checked.value[e.id])
    .map((e) => e.url.replace("tel:", ""));

  const selectedSocials: VCardSocialEntry[] = socialEntries
    .filter((e) => checked.value[e.id])
    .map((e) => ({ name: e.name, url: e.url }));

  return buildVCard(
    {
      name: includeName.value,
      website: includeWebsite.value,
      bio: includeBio.value,
    },
    selectedEmails,
    selectedPhones,
    selectedSocials,
  );
});

const qrDataUrl = ref("");
const qrError = ref(false);
const isMounted = ref(false);

async function generateQrCode() {
  try {
    qrError.value = false;
    qrDataUrl.value = await QRCode.toDataURL(vcardString.value, {
      width: 400,
      margin: 2,
      color: {
        dark: "#f5f5f0",
        light: "#090b10",
      },
      errorCorrectionLevel: "M",
    });
  } catch {
    qrDataUrl.value = "";
    qrError.value = true;
  }
}

onMounted(() => {
  isMounted.value = true;
  generateQrCode();
});

watch(vcardString, () => {
  if (isMounted.value) {
    generateQrCode();
  }
});
</script>

<template>
  <div class="vcard-widget">
    <!-- QR Code -->
    <div class="qr-wrap">
      <div class="qr-box">
        <img
          v-if="qrDataUrl"
          alt="QR code encoding a vCard for Ulrich-Matthias Schäfer"
          class="qr-img"
          :src="qrDataUrl"
        />
        <p v-else-if="qrError" class="qr-msg">Failed to generate QR code.</p>
        <p v-else class="qr-msg dim">Generating QR code…</p>
      </div>
    </div>

    <!-- Checkbox groups -->
    <div class="groups">
      <!-- Fixed info -->
      <fieldset class="group">
        <legend class="group-legend">Contact Info</legend>
        <div class="group-list">
          <label class="vcard-row">
            <span class="row-label">Name (Ulrich-Matthias Schäfer)</span>
            <input
              v-model="includeName"
              class="vcard-checkbox"
              type="checkbox"
            />
          </label>
          <label class="vcard-row">
            <span class="row-label">Website (fuzzyma.de)</span>
            <input
              v-model="includeWebsite"
              class="vcard-checkbox"
              type="checkbox"
            />
          </label>
          <label class="vcard-row">
            <span class="row-label">Bio / Description</span>
            <input
              v-model="includeBio"
              class="vcard-checkbox"
              type="checkbox"
            />
          </label>
        </div>
      </fieldset>

      <!-- Communication -->
      <fieldset class="group">
        <legend class="group-legend">Communication</legend>
        <div class="group-list">
          <label
            v-for="entry in [...emailEntries, ...phoneEntries]"
            :key="entry.id"
            class="vcard-row"
          >
            <span class="row-label">{{ entry.name }} ({{ entry.handle }})</span>
            <input
              v-model="checked[entry.id]"
              class="vcard-checkbox"
              type="checkbox"
            />
          </label>
        </div>
      </fieldset>

      <!-- Social profiles -->
      <fieldset class="group">
        <legend class="group-legend">Social Profiles</legend>
        <div class="group-list">
          <label
            v-for="social in socialEntries"
            :key="social.id"
            class="vcard-row"
          >
            <span class="row-label"
              >{{ social.name }} ({{ social.handle }})</span
            >
            <input
              v-model="checked[social.id]"
              class="vcard-checkbox"
              type="checkbox"
            />
          </label>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.vcard-widget {
  max-width: 560px;
  margin: 0 auto;
}

.qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 48px;
}

.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 280px;
  height: 280px;
  border-radius: 10px;
  border: 1px solid rgba(201, 162, 39, 0.15);
  background: rgba(255, 255, 255, 0.025);
}

@media (min-width: 640px) {
  .qr-box {
    width: 320px;
    height: 320px;
  }
}

.qr-img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

.qr-msg {
  font-size: 0.875rem;
  color: #a8a29e;
  margin: 0;
}

.qr-msg.dim {
  color: #525252;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.group {
  border: none;
  padding: 0;
  margin: 0;
}

.group-legend {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #c9a227;
  margin-bottom: 12px;
  display: block;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vcard-row {
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  border: 1px solid rgba(201, 162, 39, 0.1);
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.025);
  transition:
    border-color 0.3s ease,
    background 0.3s ease;
  user-select: none;
}

.vcard-row:hover {
  border-color: rgba(201, 162, 39, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.row-label {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 300;
  color: #f5f5f0;
}

.vcard-checkbox {
  height: 20px;
  width: 20px;
  cursor: pointer;
  appearance: none;
  border-radius: 4px;
  border: 1px solid rgba(201, 162, 39, 0.25);
  background: transparent;
  transition:
    border-color 0.2s,
    background-color 0.2s;
  flex-shrink: 0;
}

.vcard-checkbox:checked {
  border-color: #c9a227;
  background-color: #c9a227;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='%23090b10' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.vcard-checkbox:focus-visible {
  outline: 2px solid #c9a227;
  outline-offset: 2px;
}
</style>
