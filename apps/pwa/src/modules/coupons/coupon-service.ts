import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { CouponDto, CouponEntity, CouponRuleDto, CouponRuleEntity } from "./coupon-types";

export async function createCouponRule(dto: CouponRuleDto) {
  return MainRequest.post<CouponRuleEntity>('/coupon-rules', dto);
}

export async function updateCouponRule(id: string, dto: CouponRuleDto) {
  return MainRequest.put<CouponRuleEntity>(`/coupon-rules/${id}`, dto);
}

export async function archiveCouponRule(id: string) {
  return MainRequest.delete(`/coupon-rules/${id}`);
}

export async function getCouponRules(query?: any) {
  return MainRequest.get<ResponseList<CouponRuleEntity>>('/coupon-rules', query);
}

export async function getCoupons(q?: any) {
  return MainRequest.get<ResponseList<CouponEntity>>('/coupons', q);
}

export async function createCoupon(dto: CouponDto) {
  return MainRequest.post<CouponEntity>('/coupons', dto);
}

export async function getCoupon(id: string) {
  return MainRequest.get<CouponEntity>(`/coupons/${id}`);
}

export async function getCouponByCode(code: string) {
  return MainRequest.get<CouponEntity>(`/coupons/codes/${code}`);
}

export function getCouponCode(coupon: CouponEntity) {
  return coupon.code ? coupon.code.split('-')[1] : '';
}