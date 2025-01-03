import {
  Client,
  TextChannel,
  GatewayIntentBits,
  EmbedBuilder,
} from 'discord.js';
import { FlatElement } from '../global.types';

export default class DiscordService {
  private client: Client;
  private token: string;
  private channelId: string;

  constructor(token: string, channelId: string) {
    this.token = token;
    this.channelId = channelId;

    this.client = new Client({
      intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }
  public constructEmbed(flat: FlatElement): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(flat.description || 'NO DESCRIPTION FOUND')
      .setURL(flat.link)
      .setTimestamp();

    const fieldDefinitions: Record<string, (f: FlatElement) => string | null> =
      {
        Price: f => f.price,
        Rooms: f => f.rooms,
        'Square Meters': f => f.squareMeters,
        'Price per Square Meter': f =>
          f.price && f.squareMeters
            ? (parseInt(f.price) / parseInt(f.squareMeters)).toFixed(2)
            : null,
        Location: f => f.location,
        Address: f => f.address || 'NO ADDRESS FOUND',
        'Free Area': f => f.freeArea || 'NO OUTSIDE AREA',
        'Published At': f => f.publishedAt,
        Company: f => f.company,
        ID: f => f.id,
      };
    Object.entries(fieldDefinitions).forEach(([name, getValue]) => {
      const value = getValue(flat);
      if (value) embed.addFields({ name, value });
      if (value && name === 'Price per Square Meter' && parseInt(value) < 15) {
        embed.setColor('#00FF00');
      }
      if (value && name === 'Price per Square Meter' && parseInt(value) > 20) {
        embed.setColor('#FF0000');
      }
    });

    if (flat.tags && flat.tags.length > 0) {
      embed.addFields({
        name: 'Tags',
        value: flat.tags.join(', '),
      });
    }

    if (flat.images && flat.images.length > 0) {
      embed.setImage(flat.images[0]);
    }

    return embed;
  }

  public async connect(): Promise<void> {
    await this.client.login(this.token);
  }

  public async publishMessage(message: EmbedBuilder): Promise<void> {
    try {
      const channel = (await this.client.channels.fetch(
        this.channelId
      )) as TextChannel;

      if (!channel) {
        console.error(`Channel with id ${this.channelId} not found`);
        return;
      }

      await channel.send({ embeds: [message] });
      return Promise.resolve();
    } catch (error) {
      console.error(error);
    }
  }

  public async isFlatPosted(flatId: string): Promise<boolean> {
    try {
      const channel = (await this.client.channels.fetch(
        this.channelId
      )) as TextChannel;

      if (!channel) {
        throw new Error(`Channel with id ${this.channelId} not found`);
      }

      const messages = await channel.messages.fetch({ limit: 100 });
      const message = messages.find(message =>
        message.embeds[0].data.fields?.find(
          field => field.name === 'ID' && field.value === flatId
        )
      );

      return message ? true : false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        console.error(error);
        throw new Error('An unknown error occurred');
      }
    }
  }

  disconnect(): void {
    if (!this.client) {
      return;
    }
    this.client.destroy();
  }
}
