import { ResponseList } from "@/types";
import { CouponDto, CouponEntity, CouponRuleDto, CouponRuleEntity } from "./coupon-types";
import { apiClient } from "../apis";

export async function createCouponRule(dto: CouponRuleDto) {
  return apiClient.post<CouponRuleEntity>("/coupon-rules", dto);
}

export async function updateCouponRule(id: string, dto: CouponRuleDto) {
  return apiClient.put<CouponRuleEntity>(`/coupon-rules/${id}`, dto);
}

export async function archiveCouponRule(id: string) {
  return apiClient.delete(`/coupon-rules/${id}`);
}

export async function getCouponRules(query?: any) {
  return apiClient.get<ResponseList<CouponRuleEntity>>("/coupon-rules", { params: query });
}

export async function getCoupons(query?: any) {
  return apiClient.get<ResponseList<CouponEntity>>("/coupons", { params: query });
}

export async function createCoupon(dto: CouponDto) {
  return apiClient.post<CouponEntity>("/coupons", dto);
}

export async function getCoupon(id: string) {
  return apiClient.get<CouponEntity>(`/coupons/${id}`);
}

export async function getCouponByCode(code: string) {
  return apiClient.get<CouponEntity>(`/coupons/codes/${code}`);
}

export function getCouponCode(coupon: CouponEntity) {
  return coupon.code ? coupon.code.split("-")[1] : "";
}
