import { api } from "../apis";
import { LinkDto, LinkEntity } from "./links-types";

export async function createLink(dto: LinkDto) {
  return api.post<LinkEntity>(`/links`, dto)
}

export async function getLink(slug: string) {
  return api.get<LinkEntity>(`/links/${slug}`);
}