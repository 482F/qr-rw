<template>
  <div class="main-component">
    <div class="control">
      <v-btn @click="copy">コピー</v-btn>
      <a
        :class="{
          'no-link-style': true,
          'disabled-link': !isUrl,
        }"
        :href="code"
        target="_blank"
      >
        <v-btn :disabled="!isUrl">URLを開く</v-btn>
      </a>
      <v-text-field
        class="code"
        v-model="code"
        density="compact"
        variant="outlined"
        :type="showCode ? 'text' : 'password'"
        :append-inner-icon="showCode ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showCode = !showCode"
      />
    </div>
    <canvas id="canvas"></canvas>
    <div id="qrcode"></div>
    <v-snackbar v-model="snackbar" location="top" color="white">
      コピーしました
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'
import QRCode from '../qrcode'
import { onMounted, ref, watch, computed } from 'vue'
const code = ref('')
const showCode = ref(false)
const snackbar = ref(false)
const isUrl = computed(() => {
  try {
    new URL(code.value)
    return true
  } catch {
    return false
  }
})
function copy() {
  navigator.clipboard.writeText(code.value)
  snackbar.value = true
}
async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}
async function wait<F extends () => any>(
  func: F,
  intervalMs: number = 100,
  timeoutMs: number = 0
) {
  let timeouted = false
  if (0 < timeoutMs) {
    setTimeout(() => (timeouted = true), timeoutMs)
  }
  type R = F extends () => infer U ? U : never
  let result: R | null = null

  while (!result && !timeouted) {
    result = await func()
    await sleep(intervalMs)
  }

  if (!result) {
    throw new Error('wait 関数がタイムアウトしました')
  }
  return result
}
onMounted(async () => {
  watch(code, () => {
    qrEl.innerHTML = ''
    new QRCode(qrEl, {
      text: code.value,
      width: 1280,
      height: 1280,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    })
  })

  const video = document.createElement('video')
  const canvas = await wait(() =>
    document.querySelector<HTMLCanvasElement>('canvas#canvas')
  )
  const ctx = await wait(() => canvas.getContext('2d'))
  const qrEl = await wait(() => document.querySelector('div#qrcode'))
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
  })
  video.srcObject = stream
  video.setAttribute('playsinline', 'true')
  await video.play()
  canvas.classList.add('videoed')

  while (true) {
    await sleep(250)
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      continue
    }
    canvas.height = video.videoHeight
    canvas.width = video.videoWidth
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    code.value =
      jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
        ?.data ?? code.value
  }
})
</script>

<style lang="scss" scoped>
.main-component {
  height: 100vh;
  width: min(calc(100vw - 40px), 800px);
  margin: 20px auto;
  display: grid;
  // grid-template: auto 0.5fr 0.5fr / minmax(0, 1fr);
  grid-template: auto 1fr 0px / minmax(0, 1fr);
  grid-template-areas:
    'control'
    'main'
    'hidden';
  overflow: hidden;
  gap: 10px;
  > .control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    ::v-deep(.v-input__details) {
      display: none;
    }
  }
  > #qrcode {
    display: flex;
    justify-content: center;
    overflow: hidden;

    > ::v-deep(*) {
      height: 80%;
    }
  }
  > #canvas:not(.videoed) {
    display: none;
    grid-area: hidden;
  }
  > #canvas.videoed {
    grid-area: main;
  }
  .no-link-style {
    color: black;
    text-decoration: none;
  }
  .disabled-link {
    pointer-events: none;
  }
}
</style>
