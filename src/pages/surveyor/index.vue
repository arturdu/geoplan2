<script lang="ts" setup>
import { orders, users, contractors, activities, weatherData } from '@/data/mock'

// ── Stat data ──────────────────────────────────────────
const ordersCount = orders.length
const mediaCount = orders.reduce((sum, o) => sum + o.orderMedia.length, 0)
const activityCount = activities.length

// Generate fake 12-month trend data
const ordersTrend = [8, 12, 15, 11, 18, 22, 19, 25, 21, 28, 24, 30]
const mediaTrend = [3, 5, 4, 7, 6, 9, 8, 11, 10, 14, 12, 16]
const activityTrend = [15, 20, 18, 25, 22, 30, 28, 35, 32, 40, 38, 45]

const sparklineOptions = (color: string) => ({
  chart: {
    type: 'area' as const,
    parentHeightOffset: 0,
    toolbar: { show: false },
    sparkline: { enabled: true },
  },
  markers: { colors: 'transparent', strokeColors: 'transparent' },
  grid: { show: false },
  colors: [color],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 0.9, opacityFrom: 0.5, opacityTo: 0.07, stops: [0, 80, 100] },
  },
  dataLabels: { enabled: false },
  stroke: { width: 2, curve: 'smooth' as const },
  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { show: false },
  tooltip: { enabled: false },
})

// ── Top 10 surveyors by orders ──────────────────────────
const surveyorUsers = users
  .filter(u => u.type === 'surveyor')
  .sort((a, b) => b.orders_count - a.orders_count)
  .slice(0, 10)

const surveyorBarSeries = [{
  name: 'Zlecenia',
  data: surveyorUsers.map(u => u.orders_count),
}]

const surveyorBarOptions = {
  chart: { type: 'bar' as const, toolbar: { show: false }, parentHeightOffset: 0 },
  plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
  colors: ['#28C76F'],
  dataLabels: { enabled: true, style: { fontSize: '12px' } },
  xaxis: { categories: surveyorUsers.map(u => u.full_name) },
  yaxis: { labels: { style: { fontSize: '12px' } } },
  grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  tooltip: { y: { formatter: (val: number) => `${val} zlecen` } },
}

// ── Top 10 contractors by orders ────────────────────────
const topContractors = [...contractors]
  .sort((a, b) => b.orders_count - a.orders_count)
  .slice(0, 10)

const contractorBarSeries = [{
  name: 'Zlecenia',
  data: topContractors.map(c => c.orders_count),
}]

const contractorBarOptions = {
  chart: { type: 'bar' as const, toolbar: { show: false }, parentHeightOffset: 0 },
  plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
  colors: ['#7367F0'],
  dataLabels: { enabled: true, style: { fontSize: '12px' } },
  xaxis: { categories: topContractors.map(c => c.short) },
  yaxis: { labels: { style: { fontSize: '12px' } } },
  grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  tooltip: { y: { formatter: (val: number) => `${val} zlecen` } },
}

// ── Weather helpers ─────────────────────────────────────
const weatherIconUrl = (icon: string) => `https://openweathermap.org/img/wn/${icon}@2x.png`
</script>

<template>
  <div>
    <!-- Stat Cards with Sparklines -->
    <VRow class="mb-6">
      <VCol cols="12" md="4">
        <VCard>
          <VCardText class="d-flex flex-column pb-0">
            <VAvatar size="42" variant="tonal" color="success" rounded class="mb-2">
              <VIcon icon="tabler-file-text" size="26" />
            </VAvatar>
            <h5 class="text-h5">{{ ordersCount }}</h5>
            <div class="text-sm">Zlecenia Total</div>
          </VCardText>
          <VueApexCharts
            :options="sparklineOptions('#28C76F')"
            :series="[{ name: 'Zlecenia', data: ordersTrend }]"
            :height="80"
          />
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard>
          <VCardText class="d-flex flex-column pb-0">
            <VAvatar size="42" variant="tonal" color="info" rounded class="mb-2">
              <VIcon icon="tabler-upload" size="26" />
            </VAvatar>
            <h5 class="text-h5">{{ mediaCount }}</h5>
            <div class="text-sm">Zaladowane Pliki</div>
          </VCardText>
          <VueApexCharts
            :options="sparklineOptions('#00CFE8')"
            :series="[{ name: 'Pliki', data: mediaTrend }]"
            :height="80"
          />
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard>
          <VCardText class="d-flex flex-column pb-0">
            <VAvatar size="42" variant="tonal" color="warning" rounded class="mb-2">
              <VIcon icon="tabler-activity" size="26" />
            </VAvatar>
            <h5 class="text-h5">{{ activityCount }}</h5>
            <div class="text-sm">Zarejestrowana Aktywnosc</div>
          </VCardText>
          <VueApexCharts
            :options="sparklineOptions('#FF9F43')"
            :series="[{ name: 'Aktywnosc', data: activityTrend }]"
            :height="80"
          />
        </VCard>
      </VCol>
    </VRow>

    <!-- Bar Charts - Top 10 -->
    <VRow class="mb-6">
      <VCol cols="12" md="6">
        <VCard>
          <VCardItem>
            <VCardTitle>Geodeta | Top 10 | Ostatnie 12 miesiecy</VCardTitle>
          </VCardItem>
          <VCardText>
            <VueApexCharts
              :options="surveyorBarOptions"
              :series="surveyorBarSeries"
              :height="350"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
        <VCard>
          <VCardItem>
            <VCardTitle>Wykonawca | Top 10 | Ostatnie 12 miesiecy</VCardTitle>
          </VCardItem>
          <VCardText>
            <VueApexCharts
              :options="contractorBarOptions"
              :series="contractorBarSeries"
              :height="350"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Weather Widgets -->
    <VRow>
      <VCol
        v-for="weather in weatherData"
        :key="weather.project_name"
        cols="12"
        md="4"
        lg="3"
      >
        <VCard>
          <VCardItem>
            <VCardTitle class="text-body-1 font-weight-bold">
              {{ weather.project_name }}
            </VCardTitle>
          </VCardItem>
          <VCardText>
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <img
                  :src="weatherIconUrl(weather.current.icon)"
                  :alt="weather.current.description"
                  width="50"
                  height="50"
                />
                <div class="ms-2">
                  <h3 class="text-h3">{{ weather.current.temp }}&deg;C</h3>
                  <span class="text-sm text-medium-emphasis">{{ weather.current.description }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex gap-x-4 text-sm text-medium-emphasis">
              <div>
                <VIcon icon="tabler-droplet" size="16" class="me-1" />
                {{ weather.current.humidity }}%
              </div>
              <div>
                <VIcon icon="tabler-wind" size="16" class="me-1" />
                {{ weather.current.wind }} km/h
              </div>
            </div>

            <VDivider class="my-3" />

            <div class="d-flex justify-space-between">
              <div
                v-for="day in weather.forecast"
                :key="day.day"
                class="text-center"
              >
                <div class="text-xs text-medium-emphasis">{{ day.day }}</div>
                <img
                  :src="weatherIconUrl(day.icon)"
                  :alt="day.day"
                  width="30"
                  height="30"
                />
                <div class="text-xs font-weight-medium">{{ day.temp }}&deg;</div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
