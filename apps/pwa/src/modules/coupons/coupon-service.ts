import { ResponseList } from "@/types";
import { CouponDto, CouponEntity, CouponRuleDto, CouponRuleEntity } from "./coupon-types";
import { restClient } from "../apis/rest-client";

export async function createCouponRule(dto: CouponRuleDto) {
  return restClient.post<CouponRuleEntity>("/coupon-rules", dto);
}

export async function updateCouponRule(id: string, dto: CouponRuleDto) {
  return restClient.put<CouponRuleEntity>(`/coupon-rules/${id}`, dto);
}

export async function archiveCouponRule(id: string) {
  return restClient.delete(`/coupon-rules/${id}`);
}

export async function getCouponRules(query?: any) {
  return restClient.get<ResponseList<CouponRuleEntity>>("/coupon-rules", { params: query });
}

export async function getCoupons(query?: any) {
  return restClient.get<ResponseList<CouponEntity>>("/coupons", { params: query });
}

export async function createCoupon(dto: CouponDto) {
  return restClient.post<CouponEntity>("/coupons", dto);
}

export async function getCoupon(id: string) {
  return restClient.get<CouponEntity>(`/coupons/${id}`);
}

export async function getCouponByCode(code: string) {
  return restClient.get<CouponEntity>(`/coupons/codes/${code}`);
}

export function getCouponCode(coupon: CouponEntity) {
  return coupon.code ? coupon.code.split("-")[1] : "";
}
