<?php

namespace App\Services\LearningService;

use App\Services\Service;
use App\Services\ServiceContract;
use App\Services\Traits\HasBranch;
use App\Helpers\UserRole;
use App\Helpers\UserBranch;
use Illuminate\Support\Facades\Auth;

class Teacher extends Service implements ServiceContract
{

  use HasBranch;

  protected function serviceAddress(): string
  {
    return config('services.btw.learning', '');
  }

  public function getAll($query = [])
  {
    $user = collect(Auth()->user())->first();
    $showAllMentors = in_array("office_v2.learning_schedule.show_all_mentors", $user["resources"]);

    if(!UserRole::isAdmin()) $query['branch_code'] = [Auth()->user()->branch_code, 'PT0000'];
    if(UserBranch::isCentralBranchUser() || $showAllMentors) unset($query['branch_code']);

    $response = $this->http->get(url: '/user', query: $query);
    $data = json_decode($response?->body());
    return $data?->data ?? [];
  }
}
