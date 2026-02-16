<script lang="ts" setup>
import { posts as mockPosts, projects } from '@/data/mock'
import type { Post, PostCategory } from '@/types'
import { postCategoryColors, postCategoryLabels } from '@/types'

const search = ref('')
const categoryFilter = ref<PostCategory | ''>('')
const drawerVisible = ref(false)
const editingPost = ref<Post | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const postToDelete = ref<Post | null>(null)

const postList = ref<Post[]>([...mockPosts])

const categoryOptions = Object.entries(postCategoryLabels).map(([value, label]) => ({
  value,
  label,
}))

const filteredPosts = computed(() => {
  return postList.value.filter(post => {
    const matchesSearch = !search.value
      || post.title.toLowerCase().includes(search.value.toLowerCase())
      || post.body.toLowerCase().includes(search.value.toLowerCase())

    const matchesCategory = !categoryFilter.value || post.category === categoryFilter.value

    return matchesSearch && matchesCategory
  })
})

// Form state
const formCategory = ref<PostCategory>('info')
const formTitle = ref('')
const formBody = ref('')
const formValid = ref(false)

const titleRules = [(v: string) => !!v || 'Tytul jest wymagany']
const bodyRules = [(v: string) => !!v || 'Tresc jest wymagana']

function openCreateDrawer() {
  editingPost.value = null
  formCategory.value = 'info'
  formTitle.value = ''
  formBody.value = ''
  drawerVisible.value = true
}

function openEditDrawer(post: Post) {
  editingPost.value = post
  formCategory.value = post.category
  formTitle.value = post.title
  formBody.value = post.body
  drawerVisible.value = true
}

function submitForm() {
  if (!formTitle.value || !formBody.value) return

  if (editingPost.value) {
    const idx = postList.value.findIndex(p => p.id === editingPost.value!.id)
    if (idx !== -1) {
      postList.value[idx] = {
        ...postList.value[idx],
        title: formTitle.value,
        body: formBody.value,
        category: formCategory.value,
      }
    }
    snackbarText.value = 'Post zaktualizowany pomyslnie'
  }
  else {
    const newPost: Post = {
      id: Date.now(),
      title: formTitle.value,
      body: `<p>${formBody.value}</p>`,
      category: formCategory.value,
      image_urls: [],
      author: { full_name: 'Jan Kowalski', avatar_url: null },
      created_at: new Date().toISOString(),
    }
    postList.value.unshift(newPost)
    snackbarText.value = 'Post utworzony pomyslnie'
  }

  drawerVisible.value = false
  snackbar.value = true
}

function confirmDelete(post: Post) {
  postToDelete.value = post
  deleteDialog.value = true
}

function deletePost() {
  if (postToDelete.value) {
    postList.value = postList.value.filter(p => p.id !== postToDelete.value!.id)
    snackbarText.value = 'Post usuniety'
    snackbar.value = true
  }
  deleteDialog.value = false
  postToDelete.value = null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-news"
          size="24"
          class="me-1"
        />
        <span class="text-h5">Geo Fun Posts</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj postow..."
          density="compact"
          hide-details
          style="max-inline-size: 280px;"
        />
        <VSelect
          v-model="categoryFilter"
          :items="[{ value: '', label: 'Wszystkie' }, ...categoryOptions]"
          item-title="label"
          item-value="value"
          placeholder="Kategoria"
          density="compact"
          hide-details
          clearable
          style="max-inline-size: 200px;"
        />
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDrawer"
        >
          Nowy Post
        </VBtn>
      </VCardTitle>
    </VCard>

    <VRow>
      <VCol
        v-for="post in filteredPosts"
        :key="post.id"
        cols="12"
        md="6"
        xl="4"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center gap-2 pa-4 pb-2">
            <span class="text-success font-weight-bold text-wrap">{{ post.title }}</span>
            <VSpacer />
            <VChip
              :color="postCategoryColors[post.category]"
              size="small"
              label
            >
              {{ postCategoryLabels[post.category] }}
            </VChip>
          </VCardTitle>
          <VCardText class="pa-4 pt-0">
            <div
              class="text-body-1 mb-3"
              v-html="post.body"
            />
            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">
                <VIcon
                  icon="tabler-user"
                  size="14"
                  class="me-1"
                />
                {{ post.author.full_name }}
                <span class="mx-1">|</span>
                <VIcon
                  icon="tabler-clock"
                  size="14"
                  class="me-1"
                />
                {{ formatDate(post.created_at) }}
              </div>
              <div>
                <VBtn
                  icon="tabler-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEditDrawer(post)"
                />
                <VBtn
                  icon="tabler-trash"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(post)"
                />
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Empty state -->
    <VCard
      v-if="filteredPosts.length === 0"
      class="pa-6 text-center"
    >
      <VIcon
        icon="tabler-news-off"
        size="48"
        color="secondary"
        class="mb-2"
      />
      <p class="text-body-1 text-medium-emphasis">
        Brak postow do wyswietlenia
      </p>
    </VCard>

    <!-- Create/Edit Drawer -->
    <VNavigationDrawer
      v-model="drawerVisible"
      location="end"
      temporary
      width="400"
    >
      <div class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
          <h5 class="text-h5">
            {{ editingPost ? 'Edytuj Post' : 'Nowy Post' }}
          </h5>
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="drawerVisible = false"
          />
        </div>

        <VForm
          v-model="formValid"
          @submit.prevent="submitForm"
        >
          <VSelect
            v-model="formCategory"
            :items="categoryOptions"
            item-title="label"
            item-value="value"
            label="Kategoria"
            class="mb-4"
          />

          <VTextField
            v-model="formTitle"
            label="Tytul"
            :rules="titleRules"
            class="mb-4"
          />

          <VTextarea
            v-model="formBody"
            label="Tresc"
            :rules="bodyRules"
            rows="6"
            class="mb-4"
          />

          <VBtn
            type="submit"
            color="primary"
            block
            :disabled="!formValid"
          >
            {{ editingPost ? 'Zapisz Zmiany' : 'Opublikuj' }}
          </VBtn>
        </VForm>
      </div>
    </VNavigationDrawer>

    <!-- Delete Dialog -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="tabler-alert-triangle"
            color="error"
            class="me-2"
          />
          Potwierdzenie usuwania
        </VCardTitle>
        <VCardText>Czy na pewno chcesz usunac post "{{ postToDelete?.title }}"?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="deleteDialog = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="error"
            @click="deletePost"
          >
            Usun
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar"
      color="success"
      :timeout="3000"
    >
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>
