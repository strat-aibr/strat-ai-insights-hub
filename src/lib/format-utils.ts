
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 11) {
    // (DD) 9XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 3)}${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    // (DD) XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function getVariationClass(variation: number): string {
  if (variation > 0) return "metric-up";
  if (variation < 0) return "metric-down";
  return "metric-neutral";
}

export function getVariationPrefix(variation: number): string {
  if (variation > 0) return "+";
  return "";
}
