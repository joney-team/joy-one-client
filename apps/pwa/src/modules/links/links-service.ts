import { MainRequest } from "../requests/main.request";
import { LinkDto, LinkEntity } from "./links-types";

export async function createLink(dto: LinkDto) {
  return MainRequest.post<LinkEntity>(`/links`, dto)
}

export async function getLink(slug: string) {
  return MainRequest.get<LinkEntity>(`/links/${slug}`);
}