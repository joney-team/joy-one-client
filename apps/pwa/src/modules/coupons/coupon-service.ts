import { ResponseList } from "@/types";
import { CouponDto, CouponEntity, CouponRuleDto, CouponRuleEntity } from "./coupon-types";
import { api } from "../apis";

export async function createCouponRule(dto: CouponRuleDto) {
  return api.post<CouponRuleEntity>('/coupon-rules', dto);
}

export async function updateCouponRule(id: string, dto: CouponRuleDto) {
  return api.put<CouponRuleEntity>(`/coupon-rules/${id}`, dto);
}

export async function archiveCouponRule(id: string) {
  return api.delete(`/coupon-rules/${id}`);
}

export async function getCouponRules(query?: any) {
  return api.get<ResponseList<CouponRuleEntity>>('/coupon-rules', { params: query });
}

export async function getCoupons(query?: any) {
  return api.get<ResponseList<CouponEntity>>('/coupons', { params: query });
}

export async function createCoupon(dto: CouponDto) {
  return api.post<CouponEntity>('/coupons', dto);
}

export async function getCoupon(id: string) {
  return api.get<CouponEntity>(`/coupons/${id}`);
}

export async function getCouponByCode(code: string) {
  return api.get<CouponEntity>(`/coupons/codes/${code}`);
}

export function getCouponCode(coupon: CouponEntity) {
  return coupon.code ? coupon.code.split('-')[1] : '';
}