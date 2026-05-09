import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from '@aws-sdk/client-cloudwatch';
import {
  GetObjectCommand,
  HeadBucketCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { AppMessage } from '../app.message';
import { configs } from '../config/config';
import { cryptoDecrypt } from '../utils/crypto.util';
import { PluginExternalStorageEntity } from './entities/plugin-external-storage.entity';
import { PluginExternalStorageProvider } from './plugin-external-storage.types';

function getS3Client(storage: PluginExternalStorageEntity) {
  return new S3Client({
    credentials: {
      accessKeyId: cryptoDecrypt<{ key: string }>(
        storage.accessKeyId,
        configs.ENCRYPT_PASSWORD,
      ).key,
      secretAccessKey: cryptoDecrypt<{ key: string }>(
        storage.secretAccessKey,
        configs.ENCRYPT_PASSWORD,
      ).key,
    },
    region: storage.region,
    endpoint: storage.endpointUrl,
  });
}

function getS3CloudWatchClient(storage: PluginExternalStorageEntity) {
  return new CloudWatchClient({
    region: storage.region,
    credentials: {
      accessKeyId: cryptoDecrypt<{ key: string }>(
        storage.accessKeyId,
        configs.ENCRYPT_PASSWORD,
      ).key,
      secretAccessKey: cryptoDecrypt<{ key: string }>(
        storage.secretAccessKey,
        configs.ENCRYPT_PASSWORD,
      ).key,
    },
  });
}

export const pluginExternalStorageProviders: Record<
  PluginExternalStorageProvider,
  {
    ping: (storage: PluginExternalStorageEntity) => Promise<boolean>;
    signUploadUrl: (args: {
      storage: PluginExternalStorageEntity;
      fileKey: string;
    }) => Promise<string>;
    getFileUrl: (args: {
      storage: PluginExternalStorageEntity;
      fileKey: string;
    }) => Promise<string>;
    streamFile: (args: {
      storage: PluginExternalStorageEntity;
      res: Response;
      fileKey: string;
    }) => Promise<void>;
    getSize: (storage: PluginExternalStorageEntity) => Promise<number>;
    uploadFile: (args: {
      storage: PluginExternalStorageEntity;
      fileKey: string;
      fileBuffer: Buffer<ArrayBufferLike>;
    }) => Promise<string>;
  }
> = {
  [PluginExternalStorageProvider.AWS_S3]: {
    ping: async (storage) => {
      try {
        const client = getS3Client(storage);

        await client.send(
          new HeadBucketCommand({ Bucket: storage.bucketName }),
        );

        return true;
      } catch (error) {
        return false;
      }
    },
    getSize: async (storage) => {
      const cloudWatch = getS3CloudWatchClient(storage);

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 3 * 24 * 60 * 60 * 1000);

      const command = new GetMetricStatisticsCommand({
        Namespace: 'AWS/S3',
        MetricName: 'BucketSizeBytes',
        Dimensions: [
          { Name: 'BucketName', Value: storage.bucketName },
          { Name: 'StorageType', Value: 'StandardStorage' },
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 86400, // 1 day
        Statistics: ['Average'],
      });

      const res = await cloudWatch.send(command);

      const latest = res.Datapoints?.sort(
        (a, b) => b.Timestamp!.getTime() - a.Timestamp!.getTime(),
      )[0];

      return latest?.Average ?? 0;
    },
    signUploadUrl: async ({ storage, fileKey }) => {
      const client = getS3Client(storage);

      const command = new PutObjectCommand({
        Bucket: storage.bucketName,
        Key: fileKey,
      });

      return getSignedUrl(client, command, {
        expiresIn: 60 * 20,
      });
    },
    getFileUrl: async ({ storage, fileKey }) => {
      const client = getS3Client(storage);

      const command = new GetObjectCommand({
        Bucket: storage.bucketName,
        Key: fileKey,
      });

      return getSignedUrl(client, command, {
        expiresIn: 60 * 20,
      });
    },
    streamFile: async ({ storage, res, fileKey }) => {
      try {
        const client = getS3Client(storage);

        const command = new GetObjectCommand({
          Bucket: storage.bucketName,
          Key: fileKey,
        });

        const { Body, ContentType, ContentLength } = await client.send(command);

        // Convert WebStream → Node Readable stream
        const nodeStream = Body.transformToWebStream
          ? Readable.fromWeb(Body.transformToWebStream())
          : Body;

        res.setHeader(
          'Content-Type',
          ContentType || 'application/octet-stream',
        );
        res.setHeader('Content-Length', ContentLength?.toString() || '');
        res.setHeader(
          'Cache-Control',
          `public, max-age=${configs.FILE_CACHE_TIME}`,
        );

        (nodeStream as Readable).pipe(res);
      } catch (error) {
        if (error instanceof NoSuchKey) {
          throw new NotFoundException(AppMessage.FILE_NOT_FOUND);
        }

        throw error;
      }
    },
    uploadFile: async ({ storage, fileBuffer, fileKey }) => {
      const client = getS3Client(storage);

      const command = new PutObjectCommand({
        Bucket: storage.bucketName,
        Key: fileKey,
        Body: fileBuffer,
      });

      await client.send(command);
      return fileKey;
    },
  },
};
