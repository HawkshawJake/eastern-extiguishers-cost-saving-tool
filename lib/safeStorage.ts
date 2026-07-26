// Browsers partition — and sometimes block outright — storage inside a
// third-party iframe. The calculator must keep working when that happens, so
// every sessionStorage access goes through here.

const memory = new Map<string, string>()

export function getStored(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

export function setStored(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    memory.set(key, value)
  }
}

export function removeStored(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    memory.delete(key)
  }
}

export function storedKeys(): string[] {
  try {
    return Object.keys(sessionStorage)
  } catch {
    return [...memory.keys()]
  }
}
