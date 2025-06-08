export const isServer = () => typeof window === 'undefined';
export const wait = (time: number) => new Promise((r) => setTimeout(r, time));