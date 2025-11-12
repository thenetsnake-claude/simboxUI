import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface SMSRequest {
  to?: string[];
  contacts?: number[];
  groups?: number[];
  text: string;
  date?: string;
  encoding?: 'standard' | 'unicode';
  validity?: '5m' | '10m' | '30m' | '1h';
  modem_no?: number;
}

export interface BinaryRequest {
  to: string;
  data: string;
  modem_no?: number;
}

export interface ContactRequest {
  name: string;
  number: string;
}

export interface GroupRequest {
  name: string;
}

@Injectable()
export class SMSEagleService {
  private readonly logger = new Logger(SMSEagleService.name);
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.SMSEAGLE_BASE_URL,
      headers: {
        'access-token': process.env.SMSEAGLE_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use((config) => {
      this.logger.debug(`SMSEagle API Request: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`SMSEagle API Response: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error(`SMSEagle API Error: ${error.message}`);
        throw error;
      },
    );
  }

  // ========== Messages ==========

  async getMessages(folder: string, params?: any) {
    const response = await this.client.get(`/messages/${folder}`, { params });
    return response.data;
  }

  async sendSMS(data: SMSRequest) {
    const response = await this.client.post('/messages/sms', data);
    return response.data;
  }

  async sendBinarySMS(data: BinaryRequest) {
    const response = await this.client.post('/messages/binary', data);
    return response.data;
  }

  // ========== Contacts ==========

  async getContacts(params?: any) {
    const response = await this.client.get('/phonebook/contacts', { params });
    return response.data;
  }

  async getContact(id: number) {
    const response = await this.client.get(`/phonebook/contacts/${id}`);
    return response.data;
  }

  async createContact(data: ContactRequest) {
    const response = await this.client.post('/phonebook/contacts', data);
    return response.data;
  }

  async updateContact(id: number, data: ContactRequest) {
    const response = await this.client.patch(`/phonebook/contacts/${id}`, data);
    return response.data;
  }

  async deleteContact(id: number) {
    const response = await this.client.delete(`/phonebook/contacts/${id}`);
    return response.data;
  }

  // ========== Groups ==========

  async getGroups(params?: any) {
    const response = await this.client.get('/phonebook/groups', { params });
    return response.data;
  }

  async getGroup(id: number) {
    const response = await this.client.get(`/phonebook/groups/${id}`);
    return response.data;
  }

  async createGroup(data: GroupRequest) {
    const response = await this.client.post('/phonebook/groups', data);
    return response.data;
  }

  async updateGroup(id: number, data: GroupRequest) {
    const response = await this.client.patch(`/phonebook/groups/${id}`, data);
    return response.data;
  }

  async deleteGroup(id: number) {
    const response = await this.client.delete(`/phonebook/groups/${id}`);
    return response.data;
  }

  async addContactToGroup(groupId: number, contactId: number) {
    const response = await this.client.post(`/phonebook/groups/${groupId}/members`, {
      contact_id: contactId,
    });
    return response.data;
  }

  async removeContactFromGroup(groupId: number, contactId: number) {
    const response = await this.client.delete(
      `/phonebook/groups/${groupId}/members/${contactId}`,
    );
    return response.data;
  }

  // ========== Modems ==========

  async getModemInfo(modemNo: number) {
    const response = await this.client.get(`/modem/full_info/${modemNo}`);
    return response.data;
  }

  async getModemStatus(modemNo: number) {
    const response = await this.client.get(`/modem/status/${modemNo}`);
    return response.data;
  }
}
