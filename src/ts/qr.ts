export async function makeGetQrValue(videoEl: HTMLVideoElement) {
  const BD = (window as unknown as { BarcodeDetector: any })
    .BarcodeDetector as any
  if (!navigator.mediaDevices || !BD) {
    return undefined
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: {
        exact: 'environment',
      },
    },
  })

  await new Promise((resolve) => {
    videoEl.onloadedmetadata = resolve
    videoEl.srcObject = stream
  })
  videoEl.play()

  const barcodeDetector = new BD()
  return async () => {
    console.log('A')
    const barcodes = await barcodeDetector.detect(videoEl)
    if (!barcodes.length) {
      return
    }
    console.log({barcodes})
    return barcodes[0].rawValue as string
  }
}
