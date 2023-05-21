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
      .setTitle(flat.description)
      .setURL(flat.link)
      .addFields(
        {
          name: 'ID',
          value: flat.id,
        },
        {
          name: 'Location',
          value: flat.location,
        },
        {
          name: 'Price',
          value: flat.price,
        },
        {
          name: 'Rooms',
          value: flat.rooms.toString(),
        },
        {
          name: 'Square Meters',
          value: flat.squareMeters.toString(),
        },
        {
          name: 'Published At',
          value: flat.publishedAt,
        }
      );

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

      const messages = await channel.messages.fetch();
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
    this.client.destroy();
  }
}
