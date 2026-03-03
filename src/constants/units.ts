export const STANDARD_UNITS = [
    { label: 'Grammi (g)', value: 'g' },
    { label: 'Chilogrammi (kg)', value: 'kg' },
    { label: 'Millilitri (ml)', value: 'ml' },
    { label: 'Litri (L)', value: 'L' },
    { label: 'Pezzi (pz)', value: 'pz' },
    { label: 'Cucchiaio (cucchiaio)', value: 'cucchiaio' },
    { label: 'Cucchiaino (cucchiaino)', value: 'cucchiaino' },
    { label: 'Fetta (fetta)', value: 'fetta' },
    { label: 'Sacco (sacco)', value: 'sacco' },
    { label: 'Bottiglia (bottiglia)', value: 'bottiglia' },
    { label: 'Lattina (lattina)', value: 'lattina' },
];

export const getUnitLabel = (value: string) => {
    return STANDARD_UNITS.find(u => u.value === value)?.label || value;
};
