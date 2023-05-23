<template>
  <div class="main-component">
    <div class="form">
      <v-btn variant="outlined" :disabled="!qrValue" @click="copy(qrValue)">
        コピー
      </v-btn>
      <a
        class="button-link"
        :class="{
          disabled: !isLink,
        }"
        :href="qrValue"
      >
        <v-btn variant="outlined" :disabled="!isLink"> URL を開く </v-btn>
      </a>
      <v-text-field v-model="qrValue" density="compact" variant="outlined" />
    </div>
    <video
      :class="{
        'media-enabled': mediaEnabled,
      }"
      ref="videoElRef"
    ></video>
    <div class="qrimg" ref="qrImgElRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, computed } from 'vue'
import { makeGetQrValue } from '../ts/qr'
import QRCode from '../qrcode'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = (value: string) => navigator.clipboard.writeText(value)

const qrValue = ref('')
const isLink = computed(() => qrValue.value.match(/^https?:\/\/.+\..+/))

const qrImgElRef: Ref<HTMLDivElement | undefined> = ref(undefined)
async function encodeQrPrep() {
  if (!qrImgElRef.value) return
  const qrImgEl = qrImgElRef.value
  watch(qrValue, () => {
    qrImgEl.innerHTML = ''
    new QRCode(qrImgEl, {
      text: qrValue.value,
      width: 600,
      height: 600,
      correctLevel: QRCode.CorrectLevel.H,
    })
  })
}

const mediaEnabled = ref(false)
const videoElRef: Ref<HTMLVideoElement | undefined> = ref(undefined)
async function decodeQrPrep() {
  if (!videoElRef.value) return
  const makeQrValue = await makeGetQrValue(videoElRef.value)
  mediaEnabled.value = Boolean(makeQrValue)
  if (!makeQrValue) return
  while (true) {
    await sleep(500)
    qrValue.value = (await makeQrValue()) ?? qrValue.value
  }
}
onMounted(async () => {
  encodeQrPrep()
  decodeQrPrep()
})
</script>

<style lang="scss" scoped>
.main-component {
  padding-top: 32px;
  max-width: 90vw;
  width: 600px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  > .form {
    display: flex;
    gap: 8px;
    align-items: center;
    > * {
      color: black;
    }
    > .button-link {
      text-decoration: none;
    }
  }
  ::v-deep(.v-input__details) {
    display: none;
  }
  > video:not(.media-enabled) {
    display: none;
  }
  > .qrimg {
    display: flex;
    > ::v-deep(*) {
      min-width: 0;
      flex-shrink: 1;
    }
  }
}
</style>
