import { AppLocale } from "@/modules/lang/lang-types";

export const medicalHistoryOptions: { [key in AppLocale]: string[] } = {
  [AppLocale.VI]: [
    "Tiểu đường",
    "Huyết áp cao",
    "Huyết áp thấp",
    "Bệnh lí gan/thận",
    "Tim mạch",
    "Dị ứng thuốc",
    "Lâu cầm máu",
    "Thai/kinh nguyệt",
    "Thần kinh",
  ],
  [AppLocale.EN]: [
    "Diabetes",
    "High blood pressure",
    "Low blood pressure",
    "Liver/kidney disease",
    "Heart disease",
    "Drug allergy",
    "Long-term bleeding",
    "Pregnancy/menstruation",
    "Nervous system",
  ],
};
