import dotenv from 'dotenv';
import { s3 } from './awsHelperUtils';

dotenv.config();

const randomString = (numberCharacter: number): string => {
  return `${Math.random()
  .toString(36)
  .substring(2, numberCharacter + 2)}`;
};

const FILE_TYPE_MATCH: string[] = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "image/bmp",
  "image/x-icon",
  "image/heic",
  "image/avif"
];

interface File {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

export const uploadFile = async (file: Express.Multer.File | undefined): Promise<string> => {
  if (!file) {
    throw new Error("File is undefined!");
  }

  const filePath: string = `${randomString(4)}-${new Date().getTime()}-${file.originalname}`;

  if (FILE_TYPE_MATCH.indexOf(file.mimetype) === -1) {
    throw new Error(`${file.originalname} is invalid!`);
  }

  const uploadParams = {
    Bucket: process.env.BUCKET_NAME as string,
    Body: file.buffer,
    Key: filePath,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(uploadParams).promise();
    console.log("Image upload Success");
    const fileName: string = `${data.Location}`;
    return fileName;
  } catch (error) {
    throw new Error("Failed");
  }
};
