<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { isProxy, toRaw } from 'vue';
import { signal } from 'vue-signals';

const theme = signal<string | null>(null)
const searchInput = ref('')
const searchResult = ref('')
const apiKey = import.meta.env.VITE_PEXELS_API_KEY
const photos = ref<any[]>([])
const size = ref('large')
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
const perPage = ref(20)
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
  page.value = 1
  photos.value = []
  searchResult.value = ''
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

const importPhoto = async (photo: any) => {
  if (isProxy(photo)) {
    parent.postMessage(
      {
        type: 'import-photo',
        data: {
          photo: toRaw(photo),
          size: size.value
        },
      },
      "*"
    );
  }
}

const searchMore = async () => {
  loadNewPage()
}
</script>

<template>
  <main :data-theme="theme()" class="wrapper">
    <div class="header">
      <p class="title-m mb">
        Image Lookup
      </p>
      
      <p class="body-s mb">
        Photos provided by <a href="https://pexels.com" target="_blank">Pexels</a>
      </p>

      <div class="form-group" style="margin-bottom: 8px;">
        <label class="select-label-hidden" for="size-select">
          Select image size
        </label>
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

      <span
        v-if="searchResult != ''"
      >
        <p
          v-if="photos.length > 0"
        >
          Results for "{{ searchResult }}" ({{ totalResults }} {{ totalResults === 1 ? 'result' : 'results' }})
        </p>
        <p
          v-else
        >
          No results found for "{{ searchResult }}"
        </p>
      </span>      
    </div>

    <div class="content">
      <div class="images-grid mt">
        <div v-for="photo in photos" :key="photo.id">
          <div
            class="image-container"
            :style="{ 'background-color': photo.avg_color }"
          >
            <img
              :src="photo.src[size]"
              :alt="photo.alt"
              class="cover-image"
            >
            <br>
          </div>
          <p class="body-s twolines">
            <a :href="photo.url" target="_blank">Photo</a>
            by

            <a :href="photo.photographer_url" target="_blank">
              {{ photo.photographer }}
            </a> 
          </p>
          <button
            type="button"
            data-appearance="secondary"
            @click="importPhoto(photo)"
            class="mb w-full"
            :disabled="searchInput == ''"
          >
            <svg style="fill: var(--da-tertiary);;" class="mr" width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. --><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
            Import Image
          </button>
        </div>
      </div>
      <button
        v-if="photos.length > 0 && photos.length < totalResults"
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
.mr {
  margin-right: 8px;
}
.ml {
  margin-left: 8px;
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
  min-height: 3.1em;
}
</style>
