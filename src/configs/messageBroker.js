const amqp = require('amqplib');

class MessageBroker {
  constructor() {
    this._connection = null;
    this._channel = null;

    this.initialize();
  }

  async initialize() {
    try {
      this._connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      this._channel = await this._connection.createChannel();

      console.log('RabbitMQ connection success');
    } catch (error) {
      console.error('RabbitMQ connection failed :', error);
    }
  }

  async sendMessage(queue, message) {
    if (!this._connection || !this._channel) {
      console.error('RabbitMQ server connection is not initialized!');
      return;
    }

    await this._channel.assertQueue(queue, {
      durable: true,
    });

    this._channel.sendToQueue(queue, Buffer.from(message));

    console.log(`Message sent to queue "${queue}": ${message}`);
  }
}

module.exports = new MessageBroker();
