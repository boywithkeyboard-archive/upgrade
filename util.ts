export function formatFetchErrorMessage(msg: string, res: Response) {
  return `${msg}\n  Status Code: ${res.status}\n  Status Text: ${res.statusText}`
}

export function mergeOptions<T>(options: T, defaults: T): Required<T> {
  return { ...defaults, ...options } as Required<T>
}

export const URLRegexPattern = /(https?:\/\/[^\s]+[\d\w])/g
