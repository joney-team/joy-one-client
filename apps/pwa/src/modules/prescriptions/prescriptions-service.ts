import { ResponseList } from "@/types";
import { useEffect, useState } from "react";
import { api } from "../apis";
import { useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";
import { PrescriptionDto, PrescriptionEntity } from "./prescriptions-types";

export async function createPrescription(dto: PrescriptionDto) {
  return api.post<PrescriptionEntity>(`/prescriptions`, dto);
}

export async function updatePrescription(id: string, dto: PrescriptionDto) {
  return api.put<PrescriptionEntity>(`/prescriptions/${id}`, dto);
}
 
export async function removePrescription(id: string) {
  return api.delete(`/prescriptions/${id}`);
}

export async function getPrescriptions(query?: any) {
  return api.get<ResponseList<PrescriptionEntity>>(`/prescriptions`, { params: query });
}

let cached: PrescriptionEntity[] = [];

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionEntity[]>(cached);

  const fetch = async () => [
    await getPrescriptions()
      .then((res) => {
        cached = res.data;
        setPrescriptions(res.data);
      })
      .catch(() => false)
  ]

  useEventsListener([
    EventType.PRESCRIPTIONS_NEW,
    EventType.PRESCRIPTIONS_UPDATED,
    EventType.PRESCRIPTIONS_REMOVED,
  ], () => fetch())

  useEffect(() => {
    fetch();
  }, [])

  return [prescriptions, fetch] as const;
}