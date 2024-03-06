<?php

namespace App\Services\ZoomAPIService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use App\Helpers\Zoom;

class Meeting extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return 'https://api.zoom.us/v2';
  }

  public function getMeetingById(string $zoom_meeting_id, array $query = [])
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get("/meetings/$zoom_meeting_id", $query);
  }

  public function getPastMeetingParticipants(string $zoom_meeting_id, array $query = [])
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get("/report/meetings/$zoom_meeting_id/participants", $query);
  }

  public function getMeetingRegistrants(string $zoom_meeting_id, array $query = [])
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get("/meetings/$zoom_meeting_id/registrants", $query);
  }

  public function getMeetingRegistrant(string $zoom_meeting_id, string $zoom_registrant_id)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get("/meetings/$zoom_meeting_id/registrants/$zoom_registrant_id");
  }

  public function create(string $zoom_user_id, array $payload)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->post("/users/$zoom_user_id/meetings", $payload);
  }

  public function batchRegistration(string $zoom_meeting_id, array $payload)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->post("/meetings/$zoom_meeting_id/batch_registrants", $payload);
  }

  public function update(string $zoom_meeting_id, array $payload)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->patch("/meetings/$zoom_meeting_id", $payload);
  }

  public function updateRegistrantStatus(string $zoom_meeting_id, array $payload)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->put("/meetings/$zoom_meeting_id/registrants/status", $payload);
  }

  public function delete(string $zoom_meeting_id)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->delete("/meetings/$zoom_meeting_id");
  }
}
