<?php

namespace App\Services\SchoolService;

use App\Services\Service;
use App\Services\ServiceContract;
use Illuminate\Http\Client\Response;

class School extends Service implements ServiceContract
{
  protected function serviceAddress(): string
  {
    return config('services.btw.school_admin', '');
  }

  public function get(array $query): Response
  {
    return $this->http->get(url: "/school-admin/get-all", query: $query);
  }

  public function getById(string $school_id): Response
  {
    return $this->http->get(url: "/school-admin/$school_id");
  }

  public function create(array $payload): Response
  {
    return $this->http->post(url: "/school-admin/insert", data: $payload);
  }

  public function update(array $payload): Response
  {
    return $this->http->put(url: "/school-admin/update", data: $payload);
  }

  public function getSchoolAdminBySchoolId(string $school_id): Response
  {
    return $this->http->get(url: "/school-member/school_id/$school_id");
  }

  public function createSchoolAdmin(array $payload): Response
  {
    return $this->http->post(url: "/school-member/insert", data: $payload);
  }

  public function deleteSchoolAdmin(string $school_admin_id): Response
  {
    return $this->http->delete(url: "/school-member/delete/$school_admin_id");
  }
}
