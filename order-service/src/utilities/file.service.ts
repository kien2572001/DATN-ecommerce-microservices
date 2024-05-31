import {S3Client, PutObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {v4 as uuid} from 'uuid';

@Injectable()
export class FileService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('aws_s3.region'),
      credentials: {
        accessKeyId: this.configService.get('aws_s3.accessKeyId'),
        secretAccessKey: this.configService.get('aws_s3.secretAccessKey'),
      },
    });
    this.bucketName = this.configService.get('aws_s3.bucketName');
  }


  async uploadFile(file: Express.Multer.File, folder: string = 'product-service/media') {
    const key = `${folder}/${uuid()}-${file.originalname}`;
    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
    };

    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    return {
      id: uuid(),
      key,
      url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
    }
  }

  async uploadFiles(files: Express.Multer.File[], folder: string = 'product-service/media') {
    const uploadPromises = files.map(async (file) => {
      const key = `${folder}/${uuid()}-${file.originalname}`;
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);

      return {
        id: uuid(),
        key: key,
        url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
      };
    });

    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key,
    };
    await this.s3Client.send(new DeleteObjectCommand(deleteParams));
  }
}