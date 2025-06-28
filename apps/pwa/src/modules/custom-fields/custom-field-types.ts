import { AppEntity, BaseMongoEntity } from "@/types";

export enum CustomFieldType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  DATE = "DATE",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  TEXTAREA = "TEXTAREA",
  FILE = "FILE",
}

export interface CustomFieldValue {
  customFieldId: string;
  value?: any;
}

export interface CustomField extends CustomFieldValue {
  customField: CustomFieldEntity;
}

export interface CustomFieldDto {
  type: CustomFieldType;
  label: string;
  key?: string;
  description?: string;
  config?: any;
  entities: AppEntity[];
}

export interface CustomFieldEntity extends BaseMongoEntity {
  type: CustomFieldType;
  key?: string;
  label: string;
  config?: any;
  description?: string;
  workspaceId: string;
  entities: AppEntity[];
}
