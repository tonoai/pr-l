import { NotImplementedException } from '@nestjs/common';

export class FileService {
  saveFile(_data: any, _path: string): void {
    throw new NotImplementedException('Method not implemented.');
  }

  readFile(_path: string): any {
    throw new NotImplementedException('Method not implemented.');
  }
}
