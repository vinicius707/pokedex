/**
 * Utilitários de segurança para sanitização de inputs
 */

/**
 * Configuração de limites para sanitização
 */
const SANITIZE_CONFIG = {
  maxLength: 100,
  // Apenas letras, números, espaços e hífens são permitidos
  allowedPattern: /^[a-zA-Z0-9\s-]*$/,
};

/**
 * Sanitiza input de busca removendo caracteres potencialmente perigosos
 * e limitando o tamanho máximo
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove espaços extras no início e fim
  let sanitized = input.trim();

  // Limita o tamanho máximo
  if (sanitized.length > SANITIZE_CONFIG.maxLength) {
    sanitized = sanitized.substring(0, SANITIZE_CONFIG.maxLength);
  }

  // Remove caracteres não permitidos
  sanitized = sanitized
    .split('')
    .filter((char) => SANITIZE_CONFIG.allowedPattern.test(char))
    .join('');

  return sanitized;
}

/**
 * Valida se o input é um nome de Pokemon válido
 */
export function isValidPokemonName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const sanitized = sanitizeSearchInput(name);

  // Nome deve ter entre 1 e 50 caracteres
  if (sanitized.length < 1 || sanitized.length > 50) {
    return false;
  }

  return true;
}

/**
 * Valida se o input é um ID de Pokemon válido
 */
export function isValidPokemonId(id: number | string): boolean {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;

  if (isNaN(numId) || numId < 1 || numId > 100000) {
    return false;
  }

  return Number.isInteger(numId);
}

/**
 * Extrai ID de uma URL de Pokemon de forma segura
 * Usa split em vez de regex para melhor performance
 */
export function extractPokemonIdFromUrl(url: string): number | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Remove trailing slash e split por /
    const parts = url.replace(/\/$/, '').split('/');
    const lastPart = parts[parts.length - 1];
    const id = parseInt(lastPart, 10);

    return isValidPokemonId(id) ? id : null;
  } catch {
    return null;
  }
}
