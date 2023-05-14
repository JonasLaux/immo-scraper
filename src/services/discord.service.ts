import { Client, TextChannel, GatewayIntentBits } from 'discord.js';

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
