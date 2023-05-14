import { Client, TextChannel, GatewayIntentBits } from 'discord.js';

export class DiscordPublisher {
  private client: Client;
  private token: string;
  private channelId: string;

  constructor() {
    if (
      !process.env.DISCORD_TOKEN &&
      typeof process.env.DISCORD_TOKEN !== 'string'
    ) {
      throw new Error('DISCORD_TOKEN env variable is not set');
    }
    if (
      !process.env.DISCORD_CHANNEL_ID &&
      typeof process.env.DISCORD_CHANNEL_ID !== 'string'
    ) {
      throw new Error('DISCORD_CHANNEL_ID env variable is not set');
    }

    this.token = process.env.DISCORD_TOKEN;
    this.channelId = process.env.DISCORD_CHANNEL_ID;

    this.client = new Client({
      intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  async connect(): Promise<void> {
    await this.client.login(this.token);
  }

  async publishMessage(message: string): Promise<void> {
    try {
      const channel = (await this.client.channels.fetch(
        this.channelId
      )) as TextChannel;

      if (!channel) {
        console.error(`Channel with id ${this.channelId} not found`);
        return;
      }
      await channel.send(message);
    } catch (error) {
      console.error(error);
    }
  }

  disconnect(): void {
    this.client.destroy();
  }
}
