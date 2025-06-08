export const eventOn = (
  eventTarget: EventTarget,
  successEvent: string,
  errorEvent = 'error'
): Promise<Event> => {
  let $resolve: (value: Event) => void
  let $reject: (reason?: Event) => void

  return new Promise<Event>((resolve, reject) => {
    $resolve = resolve
    $reject = reject

    eventTarget.addEventListener(successEvent, $resolve)
    eventTarget.addEventListener(errorEvent, $reject)
  }).finally(() => {
    eventTarget.removeEventListener(successEvent, $resolve)
    eventTarget.removeEventListener(errorEvent, $reject)
  })
}

export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const videoReady = (preview: HTMLVideoElement, delay: number) => new Promise((resolve) => {
  const check = () => {
    if (preview.readyState === preview.HAVE_ENOUGH_DATA) {
      resolve(0)
    } else setTimeout(check, delay)
  }
  setTimeout(check, delay)
})

export function base64ToBlob(base64: string, contentType: string) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
