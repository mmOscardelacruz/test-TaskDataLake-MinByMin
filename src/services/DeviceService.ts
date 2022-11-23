import { Device } from '../interfaces/Devices';

export class DeviceService {
  async get(): Promise<Device[]> {
    const devices: Device[] = [
      {
        serialNumber: '',
      },
    ];

    return devices;
  }
}
