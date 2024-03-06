<?php

namespace App\Services\ZoomAPIService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use App\Helpers\Zoom;

class User extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return 'https://api.zoom.us/v2';
  }

  public function getUsers(array $query)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get('/users', $query);
  }

  public function getUserById(string $zoom_user_id)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get("/users/$zoom_user_id");
  }

  public function getUserSettings(string $zoom_user_id)
  {
    return $this->http->withToken(Zoom::getAccessTokenForService())->get("/users/$zoom_user_id/settings");
  }
}
