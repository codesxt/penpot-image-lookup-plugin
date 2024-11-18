<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { signal } from 'vue-signals';

const theme = signal<string | null>(null)
const searchInput = ref('')
const searchResult = ref('')
const apiKey = import.meta.env.VITE_PEXELS_API_KEY
const photos = ref([])
const size = ref('medium')
const sizeOptions = ref([
  { key: 'original', name: 'Original' },
  { key: 'large2x', name: 'Large 2x'},
  { key: 'large', name: 'Large'},
  { key: 'medium', name: 'Medium'},
  { key: 'small', name: 'Small'},
  { key: 'portrait', name: 'Portrait' },
  { key: 'landscape', name: 'Landscape' },
  { key: 'tiny', name: 'Tiny' }
])

const page = ref(1)
const perPage = ref(10)
const totalResults = ref(0)

onMounted(() => {
  const url = new URL(window.location.href);

  const initialTheme = url.searchParams.get('theme');

  if (initialTheme) {
    theme.set(initialTheme as string);
  }

  window.addEventListener('message', (event) => {
    if (event.data.type === 'theme') {
      theme.set(event.data.content);
    }
  });
});

const clear = () => {
  photos.value = []
  totalResults.value = 0
}

const loadNewPage = () => {
  const headers = {
    'Authorization': apiKey,
  };
  const queryParams = new URLSearchParams({
    'query': searchInput.value,
    'page': page.value.toString(),
    'per_page': perPage.value.toString(),
  }).toString();
  fetch('https://api.pexels.com/v1/search?' + queryParams, { headers })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      totalResults.value = data.total_results
      photos.value = [...photos.value, ...data.photos]
      searchResult.value = searchInput.value + ''

      if (data.photos.length > 0) {
        page.value += 1
      }
    });
}

const search = async () => {
  if (searchInput.value == '') return
  clear()
  loadNewPage()
}

const searchMore = async () => {
  loadNewPage()
}
</script>

<template>
  <main :data-theme="theme()" class="wrapper">
    <div class="header">
      <p class="title-m mb">Image Lookup</p>
      
      <p class="body-s mb">
        Photos provided by <a href="https://pexels.com" target="_blank">Pexels</a>
      </p>

      <div class="form-group" style="margin-bottom: 8px;">
        <label class="select-label-hidden" for="size-select">Which is your favorite animal?</label>
        <select class="select" id="size-select" v-model="size">
          <option disabled>Select image size</option>
          <option v-for="option of sizeOptions" :value="option.key" :key="option.key">
            {{ option.name }}
          </option>
        </select>
      </div>

      <div class="form-group mb">
        <label class="input-label-hidden" for="input-2">
          Search for images...
        </label>
        <input
          v-model="searchInput"
          @keyup.enter="search"
          class="input success w-full"
          type="text"
          placeholder="Search for images..."
          id="input-search"
        >
      </div>

      <button
        type="button"
        data-appearance="primary"
        @click="search"
        class="mb w-full"
        :disabled="searchInput == ''"
      >
        Search...
      </button>

      <p
        v-if="photos.length > 0"
        class="mb"
      >
        Results for "{{ searchResult }}" ({{ totalResults }} results)
      </p>

      <p
        v-if="photos.length > 0"
        class="caption"
      >
        Right click an image to copy it and paste it into Penpot
      </p>
    </div>

    <div class="content">
      <div class="images-grid">
        <div v-for="photo in photos" :key="photo.id">
          <div class="image-container">
            <!-- <img :src="photo.src.medium" :alt="photo.alt" class="cover-image"><br> -->
            <img
              :src="photo.src[size]"
              :alt="photo.alt"
              class="cover-image"
            >
            <br>
          </div>
          <p class="body-s twolines">
            <a :href="photo.url">Photo</a>
            by

            <a :href="photo.photographer_url">
              {{ photo.photographer + '\n' }}
            </a> 
          </p>
          <!-- <button
            @click="copyImage(photo)"
            data-appearance="secondary"
            class="mt mb w-full"
          >
            COPY IMAGE
          </button> -->
        </div>
      </div>
      <button
        v-if="photos.length > 0"
        @click="searchMore"
        data-appearance="secondary"
        class="mb mt w-full"
      >
        Load more...
      </button>
    </div>
  </main>
</template>

<style scoped>
.wrapper {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--background-primary);
}
.header {
  position: fixed;
  width: 100%;
  padding: 16px;
  z-index: 10;
  background-color: var(--background-primary);
  border-bottom: 1px solid var(--df-secondary);
}
.content {
  padding: 16px;
  padding-top: 232px;
}
.mb {
  margin-bottom: 8px;
}
.mt {
  margin-top: 8px;
}
.w-full {
  width: 100%;
}
.images-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two equal columns */
  gap: 1rem;
}
.image-container {
  position: relative;
  width: 100%;
  height: 150px;
}
.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.twolines {
  line-height: 1.5;
  min-height: 2em;
}
</style>
