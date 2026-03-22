import { ResponseList } from "@/types";
import { useEffect, useState } from "react";
import { restClient } from "../apis/rest-client";
import { useEventsListener } from "../events/event-service";
import { EventType } from "@/graphql/enums.graphql";
import { PrescriptionDto, PrescriptionEntity } from "./prescriptions-types";

export async function createPrescription(dto: PrescriptionDto) {
  return restClient.post<PrescriptionEntity>(`/prescriptions`, dto);
}

export async function updatePrescription(id: string, dto: PrescriptionDto) {
  return restClient.put<PrescriptionEntity>(`/prescriptions/${id}`, dto);
}

export async function removePrescription(id: string) {
  return restClient.delete(`/prescriptions/${id}`);
}

export async function getPrescriptions(query?: any) {
  return restClient.get<ResponseList<PrescriptionEntity>>(`/prescriptions`, { params: query });
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
    () => fetch(),
  );

  useEffect(() => {
    fetch();
  }, []);

  return [prescriptions, fetch] as const;
};
