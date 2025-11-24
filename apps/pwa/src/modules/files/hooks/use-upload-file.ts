import { useMutation, useQuery } from "@apollo/client/react";
import GET_PLUGIN_EXTERNAL_STORAGE, {
  type PluginExternalStorageQuery,
  type PluginExternalStorageQueryVariables,
} from "./queryPluginExternalStorage.graphql";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import imageCompression from "browser-image-compression";
import { FileEntity, UploadFileOptions } from "../file-types";
import { api } from "@/modules/apis";

import MUTATION_PLUGIN_EXTERNAL_STORAGE_SIGN_UPLOAD_URL, {
  type PluginExternalStorageSignUploadUrlMutation,
  type PluginExternalStorageSignUploadUrlMutationVariables,
} from "./mutationPluginExternalStorageSignUploadUrl.graphql";
import axios from "axios";
import MUTATION_EXTERNAL_STORAGE_VERIFY_DNA, {
  type ExternalStorageVerifyDnaMutation,
  type ExternalStorageVerifyDnaMutationVariables,
} from "./mutationExternalStorageVerifyDna.graphql";
import { FileType } from "@/graphql/enums.graphql";

export const reduceFileSize = async (
  file: File,
  options: { maxSizeMB?: number; maxWidthOrHeight?: number }
) => {
  const isImage = IMAGE_MIME_TYPE.includes(file.type as any);
  if (!isImage) return file;

  if (options.maxSizeMB && file.size / (1024 * 1024) > options.maxSizeMB) {
    return new File([await imageCompression(file, { maxSizeMB: options.maxSizeMB })], file.name);
  }

  return new File(
    [await imageCompression(file, { maxWidthOrHeight: options.maxWidthOrHeight })],
    file.name
  );
};

export const useUploadFile = () => {
  const externalStorage = useQuery<PluginExternalStorageQuery, PluginExternalStorageQueryVariables>(
    GET_PLUGIN_EXTERNAL_STORAGE,
    { fetchPolicy: "cache-and-network" }
  );

  const [signUploadUrl] = useMutation<
    PluginExternalStorageSignUploadUrlMutation,
    PluginExternalStorageSignUploadUrlMutationVariables
  >(MUTATION_PLUGIN_EXTERNAL_STORAGE_SIGN_UPLOAD_URL);

  const [verifyDna] = useMutation<
    ExternalStorageVerifyDnaMutation,
    ExternalStorageVerifyDnaMutationVariables
  >(MUTATION_EXTERNAL_STORAGE_VERIFY_DNA);

  const uploadToInternalStorage = async (file: File, options: UploadFileOptions = {}) => {
    // Internal storage
    const formData = new FormData();
    formData.append("file", file);

    if (options.refs) {
      formData.append("refs", options.refs.join(","));
    }

    return api.formData<FileEntity>("/files/upload", formData);
  };

  return async (
    file: File,
    options: UploadFileOptions = {}
  ): Promise<{
    _id: string;
    url: string;
    path: string;
    type: FileType;
  }> => {
    const inputFile = options.compressSize ? await reduceFileSize(file, options) : file;

    if (externalStorage.data?.pluginExternalStorage) {
      const signed = await signUploadUrl({
        variables: { fileName: file.name, refs: options.refs },
      });

      if (!signed.data?.pluginExternalStorageSignUploadUrl) {
        throw Error("Failed to sign upload URL");
      }

      // Upload file to external storage
      await axios.put(signed.data?.pluginExternalStorageSignUploadUrl.signedUrl, inputFile, {
        headers: {
          "Content-Type": inputFile.type,
        },
      });

      // Verify DNA
      const result = await verifyDna({
        variables: { dna: signed.data?.pluginExternalStorageSignUploadUrl.dna },
      });

      if (!result.data?.externalStorageVerifyDna) {
        throw Error("Failed to verify DNA");
      }

      return result.data?.externalStorageVerifyDna;
    }

    // Internal storage
    return uploadToInternalStorage(inputFile, options);
  };
};

export type UseUploadFile = ReturnType<typeof useUploadFile>;
