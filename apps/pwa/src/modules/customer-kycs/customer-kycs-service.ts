import { Gender } from "@/types";
import { DateTime } from "@joy-one-client/utils/date-time";

export const parseCidDate = (d: string) => {
  if (!d) return null;
  const [date, month, year] = [+d.slice(0, 2), +d.slice(2, 4), +d.slice(4, 8)];
  return DateTime.toSeconds(new Date(year, month - 1, date));
};

export const decodeCid = (cid: string) => {
  const [cidNumber, _, cidFullName, cidBirthday, cidGender, address, cidCreatedAt] = (
    cid || ""
  ).split("|");

  const genderMatching: { [key: string]: Gender } = {
    Nam: Gender.MALE,
    Nữ: Gender.FEMALE,
  };

  return {
    cidNumber,
    cidFullName,
    cidBirthday: parseCidDate(cidBirthday),
    cidGender: genderMatching[cidGender] || Gender.OTHER,
    address,
    cidCreatedAt: parseCidDate(cidCreatedAt),
  };
};
