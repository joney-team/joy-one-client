import { Locale } from "@/modules/lang/lang-types";

export const medicalHistoryOptions: { [key in Locale]: string[] } = {
  [Locale.VI]: [
    'Tiểu đường',
    'Huyết áp cao',
    'Huyết áp thấp',
    'Bệnh lí gan/thận',
    'Tim mạch',
    'Dị ứng thuốc',
    'Lâu cầm máu',
    'Thai/kinh nguyệt',
    'Thần kinh',
  ],
  [Locale.EN]: [
    'Diabetes',
    'High blood pressure',
    'Low blood pressure',
    'Liver/kidney disease',
    'Heart disease',
    'Drug allergy',
    'Long-term bleeding',
    'Pregnancy/menstruation',
    'Nervous system',
  ]
}