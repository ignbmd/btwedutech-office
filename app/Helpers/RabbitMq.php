<?php

namespace App\Helpers;

use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Connection\AMQPStreamConnection;

class RabbitMq
{
  public static function send(string $topic, string $data)
  {
    $connection = new AMQPStreamConnection(env('RABBITMQ_HOST'), env('RABBITMQ_PORT'), env('RABBITMQ_USERNAME'), env('RABBITMQ_PASSWORD'));
    $channel = $connection->channel();

    $channel->exchange_declare('GLOBAL_X', 'topic', false, false, false);
    $msg = new AMQPMessage($data);
    $channel->basic_publish($msg, 'GLOBAL_X', $topic);

    $channel->close();
    $connection->close();
  }
}
