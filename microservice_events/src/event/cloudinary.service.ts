import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: "dhlnfpfen",
      api_key: "826948159658395",
      api_secret: "ugHBScB9rskNnKZnk29XC7WOxmY",
      secure: true,
    });
  }

  async uploadImage(fileBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'events',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      stream.end(fileBuffer);
    });
  }
}
