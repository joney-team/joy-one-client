"use client";

import { useMutation } from "@apollo/client/react";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import imageCompression from "browser-image-compression";

import { FileType } from "@/graphql/enums.graphql";
import axios from "axios";

import { SignUploadInput } from "@/graphql/types.graphql";
import { useLingui } from "@lingui/react/macro";
import { UploadFileOptions } from "../file-types";
import { FileFragment } from "../graphql/fragmentFile.graphql";
import SignPersonalUploadDocument from "../graphql/signPersonalUpload.graphql";
import SignUploadDocument from "../graphql/signUpload.graphql";
import VerifyExternalStorageDnaDocument from "../graphql/verifyExternalStorageDna.graphql";

export const reduceFileSize = async (
  file: File,
  options: { maxSizeMB?: number; maxWidthOrHeight?: number },
) => {
  const isImage = IMAGE_MIME_TYPE.includes(file.type as any);
  if (!isImage) return file;

  if (options.maxSizeMB && file.size / (1024 * 1024) > options.maxSizeMB) {
    return new File([await imageCompression(file, { maxSizeMB: options.maxSizeMB })], file.name);
  }

  return new File(
    [await imageCompression(file, { maxWidthOrHeight: options.maxWidthOrHeight })],
    file.name,
  );
};

export const useUploadFile = () => {
  const { t } = useLingui();
  const [signUploadUrl] = useMutation(SignUploadDocument);
  const [signPersonalUploadUrl] = useMutation(SignPersonalUploadDocument);
  const [verifyExternalStorageDna] = useMutation(VerifyExternalStorageDnaDocument);

  return async (
    file: File,
    options: UploadFileOptions = {},
  ): Promise<{
    _id: string;
    url: string;
    path: string;
    type: FileType;
  }> => {
    const inputFile = options.compressSize ? await reduceFileSize(file, options) : file;
    const input: SignUploadInput = {
      fileName: file.name,
      refs: options.refs,
      id: options.id,
    };

    const signedResult = options.isPersonal
      ? await signPersonalUploadUrl({
          variables: { input },
        })
      : await signUploadUrl({
          variables: { input },
        });

    if (!signedResult.data?.signUpload) {
      throw Error(t`Failed to sign upload`);
    }

    const { signedUrl, isUseExternalStorage, dna } = signedResult.data?.signUpload;

    // External storage
    if (isUseExternalStorage) {
      await axios.put(signedUrl, inputFile, {
        headers: {
          "Content-Type": file.type,
        },
      });

      const result = await verifyExternalStorageDna({
        variables: { input: { dna } },
      });

      if (!result.data?.file) {
        throw Error(t`Failed to verify DNA`);
      }

      return result.data?.file;
    }

    // Internal storage
    const formData = new FormData();
    formData.append("file", file);

    const result = await axios.post<FileFragment>(signedUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return result.data;
  };
};

export type UseUploadFile = ReturnType<typeof useUploadFile>;
