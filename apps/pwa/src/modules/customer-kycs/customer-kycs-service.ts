import { Gender } from "@/graphql/enums.graphql";
import { DateTime } from "@joy-one/utils/date-time";

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
    Nam: Gender.Male,
    Nữ: Gender.Female,
  };

  return {
    cidNumber,
    cidFullName,
    cidBirthday: parseCidDate(cidBirthday),
    cidGender: genderMatching[cidGender] || Gender.Other,
    address,
    cidCreatedAt: parseCidDate(cidCreatedAt),
  };
};
