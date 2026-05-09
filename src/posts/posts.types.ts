import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';

export class JSONContent {
  @IsString()
  type?: string;

  @IsObject()
  attrs?: Record<string, any>;

  @IsArray()
  @ValidateNested()
  content?: JSONContent[];

  @IsArray()
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];

  @IsString()
  text?: string;

  [key: string]: any;
}

export class BulkArchivePostInput {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
