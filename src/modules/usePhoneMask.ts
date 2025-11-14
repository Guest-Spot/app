type PhoneMaskDefinition = {
  name: string;
  mask: string;
  prefixes: string[];
};

const DEFAULT_PHONE_INPUT_MASK = '+1 ### ### ####';

const PHONE_MASK_DEFINITIONS: PhoneMaskDefinition[] = [
  {
    name: 'Ukraine',
    mask: '+380 (##) ###-####',
    prefixes: ['+380'],
  },
  {
    name: 'United Kingdom',
    mask: '+44 #### ### ###',
    prefixes: ['+44'],
  },
  {
    name: 'China',
    mask: '+86 ### #### ####',
    prefixes: ['+86'],
  },
  {
    name: 'Germany',
    mask: '+49 ## #### ####',
    prefixes: ['+49'],
  },
  {
    name: 'France',
    mask: '+33 # ## ## ## ##',
    prefixes: ['+33'],
  },
  {
    name: 'Brazil',
    mask: '+55 ## #####-####',
    prefixes: ['+55'],
  },
  {
    name: 'India',
    mask: '+91 #####-#####',
    prefixes: ['+91'],
  },
  {
    name: 'Australia',
    mask: '+61 # #### ####',
    prefixes: ['+61'],
  },
  {
    name: 'Russia',
    mask: '+7 ### ### ## ##',
    prefixes: ['+7'],
  },
  {
    name: 'Kyrgyzstan',
    mask: '+996 ### ## ## ##',
    prefixes: ['+996'],
  },
  {
    name: 'US & Canada',
    mask: DEFAULT_PHONE_INPUT_MASK,
    prefixes: ['+1'],
  },
];

const getLongestPrefixLength = (prefixes: string[]) => {
  const lengths = prefixes.map((prefix) => prefix.replace(/\D/g, '').length);
  return lengths.length ? Math.max(...lengths) : 0;
};

const PHONE_MASKS = PHONE_MASK_DEFINITIONS.sort(
  (a, b) => getLongestPrefixLength(b.prefixes) - getLongestPrefixLength(a.prefixes),
);

const normalizePhoneValue = (value: string): string => {
  const cleaned = value.replace(/\s+/g, '');
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (!digitsOnly) {
    return '';
  }

  if (cleaned.startsWith('00') && digitsOnly.length > 2) {
    return digitsOnly.slice(2);
  }

  return digitsOnly;
};

export const getPhoneInputMask = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const numericValue = normalizePhoneValue(value);

  if (!numericValue) {
    return DEFAULT_PHONE_INPUT_MASK;
  }

  // Mask appears only after entering at least 2 digits
  if (numericValue.length < 2) {
    return '';
  }

  // Collect all matching definitions
  const matchingDefinitions: Array<{ definition: PhoneMaskDefinition; prefixLength: number }> = [];

  for (const definition of PHONE_MASKS) {
    for (const prefix of definition.prefixes) {
      const prefixDigits = prefix.replace(/\D/g, '');
      if (prefixDigits.length === 0) continue;

      // If the entered value starts with the full country code
      if (numericValue.startsWith(prefixDigits)) {
        matchingDefinitions.push({ definition, prefixLength: prefixDigits.length });
        break;
      }

      // If the country code starts with the entered value (user is still entering the code)
      if (prefixDigits.startsWith(numericValue)) {
        matchingDefinitions.push({ definition, prefixLength: prefixDigits.length });
        break;
      }
    }
  }

  // If we found matching masks
  if (matchingDefinitions.length > 0) {
    // Sort by code length: first the shortest
    matchingDefinitions.sort((a, b) => a.prefixLength - b.prefixLength);
    const firstMatch = matchingDefinitions[0];
    if (firstMatch) {
      return firstMatch.definition.mask;
    }
  }

  return DEFAULT_PHONE_INPUT_MASK;
};

export { DEFAULT_PHONE_INPUT_MASK };
