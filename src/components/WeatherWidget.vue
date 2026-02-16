<script lang="ts" setup>
import type { WeatherData } from '@/types'

const props = withDefaults(defineProps<{
  weather: WeatherData
  compact?: boolean
}>(), {
  compact: false,
})

// ── Weather icon mapping ─────────────────────────────
const weatherIconMap: Record<string, string> = {
  '01d': 'tabler-sun',
  '01n': 'tabler-moon',
  '02d': 'tabler-cloud-sun',
  '02n': 'tabler-cloud-moon',
  '03d': 'tabler-cloud',
  '03n': 'tabler-cloud',
  '04d': 'tabler-cloud-filled',
  '04n': 'tabler-cloud-filled',
  '09d': 'tabler-cloud-rain',
  '09n': 'tabler-cloud-rain',
  '10d': 'tabler-cloud-rain',
  '10n': 'tabler-cloud-rain',
  '13d': 'tabler-snowflake',
  '13n': 'tabler-snowflake',
  '50d': 'tabler-mist',
  '50n': 'tabler-mist',
}

const getWeatherIcon = (icon: string) => weatherIconMap[icon] || 'tabler-cloud'

const getWeatherColor = (icon: string): string => {
  if (icon.startsWith('01')) return 'warning'
  if (icon.startsWith('02') || icon.startsWith('03')) return 'info'
  if (icon.startsWith('09') || icon.startsWith('10')) return 'primary'
  if (icon.startsWith('13')) return 'secondary'
  return 'info'
}

// ── Fieldwork suitability ────────────────────────────
const fieldworkSuitability = computed(() => {
  const { icon, wind, temp } = props.weather.current

  // Bad conditions: heavy rain, snow, mist, very high wind, extreme cold
  if (icon.startsWith('09') || icon.startsWith('10'))
    return { label: 'Niekorzystne', color: 'error', icon: 'tabler-x' }

  if (icon.startsWith('13'))
    return { label: 'Utrudnione', color: 'warning', icon: 'tabler-alert-triangle' }

  if (icon.startsWith('50'))
    return { label: 'Ograniczona widocznosc', color: 'warning', icon: 'tabler-eye-off' }

  if (wind > 12)
    return { label: 'Silny wiatr', color: 'warning', icon: 'tabler-wind' }

  if (temp < -10)
    return { label: 'Ekstremalny mroz', color: 'error', icon: 'tabler-temperature-minus' }

  return { label: 'Dobre warunki', color: 'success', icon: 'tabler-circle-check' }
})

// ── Forecast (limit to 3 days) ───────────────────────
const forecastDays = computed(() => props.weather.forecast.slice(0, 3))
</script>

<template>
  <VCard class="weather-widget" :class="{ 'weather-widget--compact': compact }">
    <VCardText :class="compact ? 'pa-3' : 'pa-4'">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="flex-grow-1">
          <h6 :class="compact ? 'text-subtitle-2' : 'text-subtitle-1'" class="font-weight-bold mb-0">
            {{ weather.project_name }}
          </h6>
          <span class="text-caption text-capitalize text-medium-emphasis">
            {{ weather.current.description }}
          </span>
        </div>
        <VIcon
          :icon="getWeatherIcon(weather.current.icon)"
          :size="compact ? 28 : 36"
          :color="getWeatherColor(weather.current.icon)"
          class="ms-2"
        />
      </div>

      <!-- Temperature + details -->
      <div class="d-flex align-center gap-4 mb-2">
        <div class="d-flex align-end gap-1">
          <span :class="compact ? 'text-h5' : 'text-h4'" class="font-weight-bold line-height-1">
            {{ weather.current.temp }}
          </span>
          <span class="text-body-2 font-weight-medium pb-1">&deg;C</span>
        </div>
        <div class="d-flex gap-3">
          <div class="d-flex align-center gap-1">
            <VIcon icon="tabler-droplet" size="14" color="info" />
            <span class="text-caption">{{ weather.current.humidity }}%</span>
          </div>
          <div class="d-flex align-center gap-1">
            <VIcon icon="tabler-wind" size="14" color="info" />
            <span class="text-caption">{{ weather.current.wind }} km/h</span>
          </div>
        </div>
      </div>

      <!-- Fieldwork suitability -->
      <VAlert
        :type="fieldworkSuitability.color === 'success' ? 'success' : fieldworkSuitability.color === 'error' ? 'error' : 'warning'"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        <template #prepend>
          <VIcon :icon="fieldworkSuitability.icon" size="18" />
        </template>
        <span class="text-caption font-weight-medium">Teren: {{ fieldworkSuitability.label }}</span>
      </VAlert>

      <!-- 3-day forecast -->
      <template v-if="!compact">
        <VDivider class="my-2" />
        <div class="d-flex justify-space-between">
          <div
            v-for="day in forecastDays"
            :key="day.day"
            class="text-center flex-grow-1"
          >
            <div class="text-caption font-weight-medium text-medium-emphasis">
              {{ day.day }}
            </div>
            <VIcon
              :icon="getWeatherIcon(day.icon)"
              size="18"
              class="my-1"
              :color="getWeatherColor(day.icon)"
            />
            <div class="text-caption font-weight-bold">
              {{ day.temp }}&deg;
            </div>
          </div>
        </div>
      </template>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.weather-widget {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &--compact {
    &:hover {
      transform: translateY(-1px);
    }
  }
}

.line-height-1 {
  line-height: 1;
}
</style>
