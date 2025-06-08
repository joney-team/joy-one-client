import { ResponseList } from "@/types";
import { useEffect, useState } from "react";
import { MainRequest } from "../requests/main.request";
import { PrescriptionDto, PrescriptionEntity } from "./prescriptions-types";
import { useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";

export async function createPrescription(dto: PrescriptionDto) {
  return MainRequest.post<PrescriptionEntity>(`/prescriptions`, dto);
}

export async function updatePrescription(id: string, dto: PrescriptionDto) {
  return MainRequest.put<PrescriptionEntity>(`/prescriptions/${id}`, dto);
}
 
export async function removePrescription(id: string) {
  return MainRequest.delete(`/prescriptions/${id}`);
}

export async function getPrescriptions(query?: any) {
  return MainRequest.get<ResponseList<PrescriptionEntity>>(`/prescriptions`, query);
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