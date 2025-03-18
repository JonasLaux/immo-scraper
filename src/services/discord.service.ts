import {
  Client,
  TextChannel,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
  Message,
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

    // Add event handlers for connection troubleshooting
    this.client.on('error', error => {
      console.error('Discord client error:', error);
    });

    this.client.on('warn', warning => {
      console.warn('Discord client warning:', warning);
    });

    this.client.on('debug', info => {
      // Uncomment for detailed debug info
      console.debug('Discord client debug:', info);
    });

    this.client.on('disconnect', () => {
      console.warn('Discord client disconnected');
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

  public async getChannel(): Promise<TextChannel> {
    const channel = (await this.client.channels.fetch(
      this.channelId
    )) as TextChannel;

    if (!channel) {
      throw new Error(`Channel with id ${this.channelId} not found`);
    }

    return channel;
  }

  public async publishMessage(
    message: EmbedBuilder,
    providedChannel: TextChannel
  ): Promise<void> {
    try {
      const channel = providedChannel;

      await channel.send({ embeds: [message] });
      return Promise.resolve();
    } catch (error) {
      console.error(error);
    }
  }

  public async isFlatPosted(
    flatId: string,
    messages: Collection<string, Message>
  ): Promise<boolean> {
    try {
      const message = messages.find(
        message =>
          message.embeds.length > 0 &&
          message.embeds[0].data?.fields?.find(
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

  disconnect(): Promise<void> {
    if (!this.client) {
      return Promise.resolve();
    }

    try {
      this.client.destroy();
      return Promise.resolve();
    } catch (error) {
      console.error('Error disconnecting Discord client:', error);
      return Promise.resolve(); // Still resolve to not block cleanup
    }
  }
}
