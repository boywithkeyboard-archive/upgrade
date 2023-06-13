export function formatFetchErrorMessage(msg: string, res: Response) {
  return `${msg}\n  Status Code: ${res.status}\n  Status Text: ${res.statusText}`
}
