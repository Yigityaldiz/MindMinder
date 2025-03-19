export function logInfo(message: string, ...optionalParams: any[]): void {
  console.info(
    `[INFO] ${new Date().toISOString()} - ${message}`,
    ...optionalParams
  );
}

export function logError(message: string, ...optionalParams: any[]): void {
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${message}`,
    ...optionalParams
  );
}
