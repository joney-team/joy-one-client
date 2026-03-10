import { ResponseList } from "@/types";
import { useEffect, useState } from "react";
import { apiClient } from "../apis";
import { useEventsListener } from "../events/event-service";
import { EventType } from "@/graphql/enums.graphql";
import { PrescriptionDto, PrescriptionEntity } from "./prescriptions-types";

export async function createPrescription(dto: PrescriptionDto) {
  return apiClient.post<PrescriptionEntity>(`/prescriptions`, dto);
}

export async function updatePrescription(id: string, dto: PrescriptionDto) {
  return apiClient.put<PrescriptionEntity>(`/prescriptions/${id}`, dto);
}

export async function removePrescription(id: string) {
  return apiClient.delete(`/prescriptions/${id}`);
}

export async function getPrescriptions(query?: any) {
  return apiClient.get<ResponseList<PrescriptionEntity>>(`/prescriptions`, { params: query });
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
      .catch(() => false),
  ];

  useEventsListener(
    [EventType.PrescriptionsNew, EventType.PrescriptionsUpdated, EventType.PrescriptionsRemoved],
    () => fetch()
  );

  useEffect(() => {
    fetch();
  }, []);

  return [prescriptions, fetch] as const;
};
