function mongoIdToUUID(id: string): string {
  const paddedId = id.padEnd(32, "0");
  return `${paddedId.substring(0, 8)}-${paddedId.substring(
    8,
    12
  )}-${paddedId.substring(12, 16)}-${paddedId.substring(
    16,
    20
  )}-${paddedId.substring(20, 32)}`;
}

export default mongoIdToUUID;
