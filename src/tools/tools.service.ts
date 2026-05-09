import { Injectable, NotFoundException } from '@nestjs/common';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import * as XLSX from 'xlsx';

@Injectable()
export class ToolsService {
  async excelToJson(file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File not found');
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  }

  async detectQrCode(file: Express.Multer.File) {
    if (!file) throw new NotFoundException('File not found');
    const image = await Jimp.read(file.buffer);

    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };

    const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);
    if (!decodedQR) return '';

    return decodedQR.data;
  }
}
