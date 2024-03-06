<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\RabbitMq;
use App\Services\StagesService\Stages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Pusher\Pusher;

class PusherController extends Controller
{
  private Stages $stageService;

  public function __construct(Stages $stageService)
  {
    $this->stageService = $stageService;
  }

  public function login(Request $request)
  {
    $pusherAppId = env("PUSHER_APP_ID");
    $pusherAppKey = env("PUSHER_APP_KEY");
    $pusherAppSecret = env("PUSHER_APP_SECRET");
    $pusherAppCluster = env("PUSHER_APP_CLUSTER");
    $pusherAppHost = env("PUSHER_APP_HOST");

    $pusher = new Pusher(
      $pusherAppKey,
      $pusherAppSecret,
      $pusherAppId,
      [
        "host" => $pusherAppHost,
        "cluster" => $pusherAppCluster,
        "useTLS" => true,
      ]
    );

    $socketId = $request->socket_id;
    $authenticatedUser = Auth::user();
    if (!Auth::check() || !$authenticatedUser) {
      return response("User is not authenticated", 401);
    }

    $userData = [
      "id" => $authenticatedUser->id,
      "user_info" => [
        "name" => $authenticatedUser->name
      ]
    ];
    $authResponse = $pusher->authenticateUser($socketId, $userData);
    return $authResponse;
  }

  public function authorizeUser(Request $request)
  {
    $pusherAppId = env("PUSHER_APP_ID");
    $pusherAppKey = env("PUSHER_APP_KEY");
    $pusherAppSecret = env("PUSHER_APP_SECRET");
    $pusherAppCluster = env("PUSHER_APP_CLUSTER");
    $pusherAppHost = env("PUSHER_APP_HOST");

    $pusher = new Pusher(
      $pusherAppKey,
      $pusherAppSecret,
      $pusherAppId,
      [
        "host" => $pusherAppHost,
        "cluster" => $pusherAppCluster,
        "useTLS" => true,
      ]
    );

    $socketId = $request->socket_id;
    $channelName = $request->channel_name;
    $explodedChannelName = explode(".", $channelName);

    $channelBranchCode = $explodedChannelName[1];
    $channelStageId = $explodedChannelName[2];
    $authenticatedUser = Auth::user();

    $stageResponse = $this->stageService->getClassStageById($channelStageId);
    $stage = json_decode($stageResponse->body())?->data ?? null;

    if (!Auth::check() || !$authenticatedUser) {
      return response("User is not authenticated", 401);
    }

    if ($authenticatedUser->branch_code !== $channelBranchCode) {
      return response("User branch code mismatch", 401);
    }

    if (!$stage) {
      return response("Stage data not found", 401);
    }

    $authResponse = $pusher->authorizeChannel($channelName, $socketId);
    return $authResponse;
  }

  public function handleWebhook(Request $request)
  {
    $requestContent = $request->getContent();
    $decodedContent = json_decode($requestContent);
    $events = $decodedContent->events;

    if (count($events) <= 0) {
      Log::error("[PusherWebhook] - Fail to handle webhook, no events has been sent from pusher", ["response" => $decodedContent]);
      return response("TOTP channel event was not found", 200);
    }

    $totpEvent = collect($events)
      ->reject(fn ($event) => !str_contains($event->channel, "private-totp."))
      ->first();

    if (!$totpEvent) {
      Log::warning("[PusherWebhook] TOTP Event was not found on pusher webhook response");
      return response("TOTP Event was not found on pusher webhook response", 200);
    }

    $pusherAppSecret = env("PUSHER_APP_SECRET");
    $pusherAppSignature = $request->header("x-pusher-signature");

    $expectedSignature = hash_hmac("sha256", $requestContent, $pusherAppSecret, false);

    if ($pusherAppSignature != $expectedSignature) {
      Log::warning("[PusherWebhook] Not authorized! - The request does not come from pusher");
      return response("Not authorized! - The request does not come from pusher", 401);
    }

    $brokerPayload = [
      "version" => 1,
      "data" => [
        "channel" => $totpEvent->channel
      ]
    ];

    if ($totpEvent->name === "channel_occupied") {
      RabbitMq::send("totp.office.connect", json_encode($brokerPayload));
      return response("channel_occupied message has been sent to totp server service", 200);
    }

    if ($totpEvent->name === "channel_vacated") {
      RabbitMq::send("totp.office.disconnect", json_encode($brokerPayload));
      return response("channel_vacated message has been sent to totp server service", 200);
    }

    return response("No action has been made", 200);
  }
}
