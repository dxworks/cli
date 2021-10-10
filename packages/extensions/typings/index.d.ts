declare global {
  interface String {
    replaceBefore(delimiter : string, replacement?: string) : string;
    removePrefix(prefix: string): string
    removeSuffix(suffix: string): string
    removeSurrounding(prefix: string, suffix: string): string
  }
  interface Array<T> {
    max(): number
    min(): number
  }
}

export {}
