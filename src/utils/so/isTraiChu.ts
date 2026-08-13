export function isTraiChu(relation: string | null | undefined): boolean {
  if (!relation) return false;
  const normalized = relation.trim().toLowerCase();
  return (
    normalized === 'trai_chu' ||
    normalized === 'trai chu' ||
    normalized === 'trai chủ' ||
    normalized === 'gia chủ' ||
    normalized === 'chủ hộ' ||
    normalized === 'bản thân' ||
    normalized === 'đại diện' ||
    normalized === 'tín chủ'
  );
}
