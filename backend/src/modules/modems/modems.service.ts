import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modem } from '../../entities/modem.entity';
import { SMSEagleService } from '../smseagle/smseagle.service';
import { UpdateModemDto } from './dto/update-modem.dto';

@Injectable()
export class ModemsService {
  constructor(
    @InjectRepository(Modem)
    private modemRepository: Repository<Modem>,
    private smsEagleService: SMSEagleService,
  ) {}

  async getModems() {
    // Ensure all 8 modems exist in database
    await this.ensureAllModems();

    const modems = await this.modemRepository.find({
      order: { modem_no: 'ASC' },
    });

    // Enrich with real-time data from SMSEagle
    const enrichedModems = await Promise.all(
      modems.map(async (modem) => {
        try {
          const status = await this.smsEagleService.getModemInfo(modem.modem_no);
          return {
            ...modem,
            status: status[0] || null,
            displayName: modem.custom_name
              ? `${modem.custom_name} (${modem.modem_no})`
              : `Modem ${modem.modem_no}`,
          };
        } catch (error) {
          // Modem might not be configured
          return {
            ...modem,
            status: null,
            displayName: modem.custom_name
              ? `${modem.custom_name} (${modem.modem_no})`
              : `Modem ${modem.modem_no}`,
          };
        }
      }),
    );

    return enrichedModems;
  }

  async getModem(modem_no: number) {
    if (modem_no < 1 || modem_no > 8) {
      throw new NotFoundException('Invalid modem number. Must be between 1 and 8');
    }

    let modem = await this.modemRepository.findOne({ where: { modem_no } });

    if (!modem) {
      // Create if doesn't exist
      modem = this.modemRepository.create({ modem_no });
      modem = await this.modemRepository.save(modem);
    }

    // Get real-time info from SMSEagle
    try {
      const status = await this.smsEagleService.getModemInfo(modem_no);
      return {
        ...modem,
        status: status[0] || null,
        displayName: modem.custom_name
          ? `${modem.custom_name} (${modem_no})`
          : `Modem ${modem_no}`,
      };
    } catch (error) {
      return {
        ...modem,
        status: null,
        displayName: modem.custom_name
          ? `${modem.custom_name} (${modem_no})`
          : `Modem ${modem_no}`,
      };
    }
  }

  async updateModem(modem_no: number, dto: UpdateModemDto) {
    if (modem_no < 1 || modem_no > 8) {
      throw new NotFoundException('Invalid modem number. Must be between 1 and 8');
    }

    let modem = await this.modemRepository.findOne({ where: { modem_no } });

    if (!modem) {
      modem = this.modemRepository.create({ modem_no });
    }

    modem.custom_name = dto.custom_name || null;
    const updatedModem = await this.modemRepository.save(modem);

    return {
      ...updatedModem,
      displayName: updatedModem.custom_name
        ? `${updatedModem.custom_name} (${modem_no})`
        : `Modem ${modem_no}`,
    };
  }

  private async ensureAllModems() {
    for (let i = 1; i <= 8; i++) {
      const exists = await this.modemRepository.findOne({ where: { modem_no: i } });
      if (!exists) {
        const modem = this.modemRepository.create({ modem_no: i });
        await this.modemRepository.save(modem);
      }
    }
  }
}
